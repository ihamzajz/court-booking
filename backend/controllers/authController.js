const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { emitRealtime } = require("../socket");
const { isDuplicateEntryError } = require("../utils/dbErrors");
const { isMailConfigured, sendPasswordResetOtpEmail } = require("../services/emailService");

const RESET_OTP_EXPIRY_MINUTES = 10;
const RESET_OTP_MAX_ATTEMPTS = 5;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const generatePasswordResetToken = ({ otpId, userId, email }) => {
  return jwt.sign(
    {
      purpose: "password_reset",
      otpId,
      userId,
      email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  cm_no: user.cm_no,
  role: user.role,
  status: user.status,
  can_book: user.can_book,
  fees_status: user.fees_status,
});

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createOtpHash = (email, otp) => {
  return crypto
    .createHash("sha256")
    .update(`${email}:${otp}:${process.env.JWT_SECRET}`)
    .digest("hex");
};

const generateSixDigitOtp = () => String(crypto.randomInt(100000, 1000000));

exports.registerUser = async (req, res) => {
  const { name, username, email, cm_no, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (!trimmedName) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!/^[a-z0-9._-]{3,}$/i.test(normalizedUsername)) {
      return res.status(400).json({
        message: "Username must be at least 3 characters and use letters/numbers",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const [users] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [normalizedEmail, normalizedUsername]
    );

    if (users.length > 0) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name, username, email, cm_no, password, role, status, can_book, fees_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trimmedName,
        normalizedUsername,
        normalizedEmail,
        String(cm_no || "").trim() || null,
        hashedPassword,
        "user",
        "inactive",
        "no",
        "paid",
      ]
    );

    emitRealtime("users:updated", { action: "registered" });
    res.status(201).json({
      message: "Registered successfully. Await admin approval.",
    });
  } catch (error) {
    console.error(error);
    if (isDuplicateEntryError(error)) {
      return res.status(409).json({ message: "User with this email or username already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password required" });
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();

    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [normalizedIdentifier, normalizedIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account inactive. Contact admin",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      ...sanitizeUser(user),
      token: generateToken(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendForgotPasswordOtp = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);

  try {
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!isMailConfigured()) {
      return res.status(503).json({
        message: "Email service is not configured yet. Add Gmail credentials to enable OTP sending.",
      });
    }

    const [users] = await pool.query(
      `SELECT id, name, email, status
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    const genericMessage =
      "If an account with that email exists, a 6-digit reset code has been sent.";

    if (!users.length || users[0].status !== "active") {
      return res.json({ message: genericMessage });
    }

    const user = users[0];
    const otp = generateSixDigitOtp();
    const otpHash = createOtpHash(normalizedEmail, otp);

    await pool.query(
      `UPDATE password_reset_otps
       SET used_at = NOW()
       WHERE user_id = ? AND used_at IS NULL`,
      [user.id]
    );

    await pool.query(
      `INSERT INTO password_reset_otps (user_id, email, otp_hash, max_attempts, expires_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [user.id, normalizedEmail, otpHash, RESET_OTP_MAX_ATTEMPTS, RESET_OTP_EXPIRY_MINUTES]
    );

    await sendPasswordResetOtpEmail({
      to: normalizedEmail,
      name: user.name,
      otp,
      expiresInMinutes: RESET_OTP_EXPIRY_MINUTES,
    });

    res.json({ message: genericMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyForgotPasswordOtp = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);
  const otp = String(req.body?.otp || "").trim();

  try {
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Enter the 6-digit OTP" });
    }

    const [records] = await pool.query(
      `SELECT pr.id, pr.user_id, pr.email, pr.otp_hash, pr.attempt_count, pr.max_attempts, pr.expires_at
       FROM password_reset_otps pr
       INNER JOIN users u ON u.id = pr.user_id
       WHERE pr.email = ?
         AND pr.used_at IS NULL
         AND pr.verified_at IS NULL
         AND pr.expires_at > NOW()
         AND u.status = 'active'
       ORDER BY pr.id DESC
       LIMIT 1`,
      [normalizedEmail]
    );

    if (!records.length) {
      return res.status(400).json({ message: "OTP is invalid or expired" });
    }

    const record = records[0];

    if (record.attempt_count >= record.max_attempts) {
      await pool.query("UPDATE password_reset_otps SET used_at = NOW() WHERE id = ?", [record.id]);
      return res.status(400).json({ message: "OTP is invalid or expired" });
    }

    const isMatch = createOtpHash(normalizedEmail, otp) === record.otp_hash;

    if (!isMatch) {
      await pool.query(
        `UPDATE password_reset_otps
         SET attempt_count = attempt_count + 1,
             used_at = CASE WHEN attempt_count + 1 >= max_attempts THEN NOW() ELSE used_at END
         WHERE id = ?`,
        [record.id]
      );
      return res.status(400).json({ message: "OTP is invalid or expired" });
    }

    await pool.query("UPDATE password_reset_otps SET verified_at = NOW() WHERE id = ?", [record.id]);

    res.json({
      message: "OTP verified successfully",
      resetToken: generatePasswordResetToken({
        otpId: record.id,
        userId: record.user_id,
        email: normalizedEmail,
      }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPasswordWithOtp = async (req, res) => {
  const resetToken = String(req.body?.resetToken || "").trim();
  const newPassword = String(req.body?.newPassword || "");

  try {
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Reset token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Reset session is invalid or expired" });
    }

    if (payload?.purpose !== "password_reset") {
      return res.status(400).json({ message: "Reset session is invalid or expired" });
    }

    const [records] = await pool.query(
      `SELECT pr.id, pr.user_id, pr.email, pr.expires_at, pr.verified_at, pr.used_at, u.id AS user_exists
       FROM password_reset_otps pr
       INNER JOIN users u ON u.id = pr.user_id
       WHERE pr.id = ? AND pr.user_id = ? AND pr.email = ?
       LIMIT 1`,
      [payload.otpId, payload.userId, payload.email]
    );

    if (!records.length) {
      return res.status(400).json({ message: "Reset session is invalid or expired" });
    }

    const record = records[0];

    if (!record.verified_at || record.used_at || new Date(record.expires_at) <= new Date()) {
      return res.status(400).json({ message: "Reset session is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, record.user_id]);
    await pool.query(
      `UPDATE password_reset_otps
       SET used_at = NOW()
       WHERE user_id = ? AND used_at IS NULL`,
      [record.user_id]
    );

    emitRealtime("users:updated", { action: "password-reset", id: record.user_id });
    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password incorrect",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);

    emitRealtime("users:updated", { action: "password-changed", id: req.user.id });
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, username, email, cm_no, role, status, can_book, fees_status
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(sanitizeUser(users[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
