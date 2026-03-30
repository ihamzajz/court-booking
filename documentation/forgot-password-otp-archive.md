# Forgot Password / OTP Archive

This document stores the removed forgot-password and OTP recovery flow so it can be restored later if needed.

## What Was Removed

- Frontend forgot-password screen
- Login screen link to forgot-password
- Stack route registration for forgot-password
- Backend auth routes for OTP request, OTP verification, and password reset
- Backend controller code for email OTP reset
- Backend email service used for OTP delivery
- Database schema creation for `password_reset_otps`

## Restore Notes

- Restore the frontend screen file and route registration.
- Restore the login button that links to `/forgot-password`.
- Restore the backend route handlers in `backend/routes/authRoutes.js`.
- Restore the removed controller functions in `backend/controllers/authController.js`.
- Restore `backend/services/emailService.js`.
- Restore the `password_reset_otps` table creation in both schema files.
- Reinstall and configure mail support before enabling the flow again.

## Archived Frontend Screen

File that was removed: `frontend/app/forgot-password.jsx`

```jsx
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import AppScreen from "../components/AppScreen";
import { AUTH_API } from "../src/config/api";

const steps = {
  request: "request",
  verify: "verify",
  reset: "reset",
};

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(steps.request);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  // Step 1: request OTP from backend.
  const requestOtp = async () => {
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${AUTH_API}/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Could not send OTP. Please try again.");
        return;
      }

      setStep(steps.verify);
      setSuccess(data?.message || "If your account exists, a code has been sent.");
    } catch {
      setError("Network error. Could not reach server. Check IP/WiFi and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the 6-digit OTP and receive a reset token.
  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${AUTH_API}/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          otp: otp.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "OTP verification failed.");
        return;
      }

      setResetToken(data.resetToken || "");
      setStep(steps.reset);
      setSuccess("OTP verified. Set your new password.");
    } catch {
      setError("Network error. Could not reach server. Check IP/WiFi and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: submit the reset token plus the new password.
  const resetPassword = async () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!resetToken) {
      setError("Reset session expired. Please request a new OTP.");
      setStep(steps.request);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${AUTH_API}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Password reset failed.");
        return;
      }

      setSuccess(data?.message || "Password reset successfully.");
      setTimeout(() => {
        router.replace("/login");
      }, 900);
    } catch {
      setError("Network error. Could not reach server. Check IP/WiFi and try again.");
    } finally {
      setLoading(false);
    }
  };

  return null;
}
```

## Archived Backend Routes

Add these back into `backend/routes/authRoutes.js` if you restore the flow:

```js
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);
```

## Archived Backend Controller Code

Functions removed from `backend/controllers/authController.js`:

```js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { isMailConfigured, sendPasswordResetOtpEmail } = require("../services/emailService");

const RESET_OTP_EXPIRY_MINUTES = 10;
const RESET_OTP_MAX_ATTEMPTS = 5;

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

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createOtpHash = (email, otp) => {
  return crypto
    .createHash("sha256")
    .update(`${email}:${otp}:${process.env.JWT_SECRET}`)
    .digest("hex");
};

const generateSixDigitOtp = () => String(crypto.randomInt(100000, 1000000));

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

    await pool.query(
      "UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?",
      [hashedPassword, record.user_id]
    );
    await pool.query(
      `UPDATE password_reset_otps
       SET used_at = NOW()
       WHERE user_id = ? AND used_at IS NULL`,
      [record.user_id]
    );

    emitRealtime("users:updated", { action: "password-reset", id: record.user_id });
    await disconnectUserSockets(record.user_id);
    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
```

## Archived Email Service

File that was removed: `backend/services/emailService.js`

```js
const nodemailer = require("nodemailer");

const isMailConfigured = () => {
  return Boolean(process.env.MAIL_USER && process.env.MAIL_APP_PASSWORD);
};

const getTransporter = () => {
  if (!isMailConfigured()) {
    throw new Error("MAIL_NOT_CONFIGURED");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_APP_PASSWORD,
    },
  });
};

const getFromAddress = () => {
  const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER;
  const fromName = process.env.MAIL_FROM_NAME || "BookFlow";

  return `"${fromName}" <${fromEmail}>`;
};

const sendPasswordResetOtpEmail = async ({ to, name, otp, expiresInMinutes }) => {
  const transporter = getTransporter();
  const safeName = name?.trim() || "there";

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: "Your BookFlow password reset code",
    text: [
      `Hello ${safeName},`,
      "",
      `Your BookFlow password reset code is ${otp}.`,
      `This code expires in ${expiresInMinutes} minutes.`,
      "",
      "If you did not request a password reset, you can ignore this email.",
    ].join("\n"),
  });
};

module.exports = {
  isMailConfigured,
  sendPasswordResetOtpEmail,
};
```

## Archived Schema Snippet

Remove or restore this table definition depending on whether OTP reset is enabled:

```sql
CREATE TABLE IF NOT EXISTS password_reset_otps (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  email VARCHAR(150) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME DEFAULT NULL,
  used_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_password_reset_otps_user_id (user_id),
  KEY idx_password_reset_otps_email (email),
  KEY idx_password_reset_otps_expires_at (expires_at),
  CONSTRAINT fk_password_reset_otps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
