const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

// REGISTER
exports.registerUser = async (req, res) => {
  const { name, username, email, cm_no, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

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
        name.trim(),
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

    res.status(201).json({
      message: "Registered successfully. Await admin approval.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
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
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      cm_no: user.cm_no,
      role: user.role,
      can_book: user.can_book,
      fees_status: user.fees_status,
      token: generateToken(user),
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {

  const { currentPassword, newPassword } = req.body;

  try {

    const [users] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [req.user.id]
    );

    const user = users[0];

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password incorrect"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashed, req.user.id]
    );

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
