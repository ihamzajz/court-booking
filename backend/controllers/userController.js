const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { emitRealtime } = require("../socket");
const { isDuplicateEntryError } = require("../utils/dbErrors");

exports.getBookingPlayers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, cm_no, fees_status
       FROM users
       WHERE status = 'active'
       ORDER BY name ASC`
    );

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.getUsers = async (_req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, username, email, cm_no, role, status, can_book, fees_status, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.createUser = async (req, res) => {
  const { name, username, email, cm_no, password, role, status, can_book, fees_status } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: "Name, username, email, and password are required" });
  }

  try {
    const normalizedName = String(name).trim();
    const normalizedUsername = String(username).trim().toLowerCase();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = ["user", "admin", "superadmin"].includes(String(role || "user"))
      ? String(role || "user")
      : "user";
    const normalizedStatus = ["active", "inactive"].includes(String(status || "inactive"))
      ? String(status || "inactive")
      : "inactive";
    const normalizedCanBook = ["yes", "no"].includes(String(can_book || "no"))
      ? String(can_book || "no")
      : "no";
    const normalizedFeesStatus = ["paid", "defaulter"].includes(String(fees_status || "paid"))
      ? String(fees_status || "paid")
      : "paid";

    if (!normalizedName) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!/^[a-z0-9._-]{3,}$/i.test(normalizedUsername)) {
      return res.status(400).json({ message: "Username must be at least 3 characters and use letters/numbers" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [normalizedEmail, normalizedUsername]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "User with this email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedCmNo = String(cm_no || "").trim() || null;

    const [result] = await pool.query(
      `INSERT INTO users (name, username, email, cm_no, password, role, status, can_book, fees_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedName,
        normalizedUsername,
        normalizedEmail,
        normalizedCmNo,
        hashedPassword,
        normalizedRole,
        normalizedStatus,
        normalizedCanBook,
        normalizedFeesStatus,
      ]
    );

    const [created] = await pool.query(
      `SELECT id, name, username, email, cm_no, role, status, can_book, fees_status, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [result.insertId]
    );

    emitRealtime("users:updated", { action: "created", id: result.insertId });
    res.status(201).json(created[0]);
  } catch (error) {
    console.error(error);
    if (isDuplicateEntryError(error)) {
      return res.status(409).json({ message: "User with this email or username already exists" });
    }
    res.status(500).json({ message: "Failed to create user" });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, username, email, cm_no, password, role, status, can_book, fees_status } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = users[0];
    const normalizedUsername = String(username || currentUser.username).trim().toLowerCase();
    const normalizedEmail = String(email || currentUser.email).trim().toLowerCase();
    const normalizedCmNo = cm_no === undefined ? currentUser.cm_no : String(cm_no || "").trim() || null;

    const [duplicate] = await pool.query(
      "SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?",
      [normalizedEmail, normalizedUsername, id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({ message: "User with this email or username already exists" });
    }

    let nextPassword = currentUser.password;
    if (password && String(password).trim()) {
      nextPassword = await bcrypt.hash(String(password).trim(), 10);
    }

    await pool.query(
      `UPDATE users
       SET name = ?, username = ?, email = ?, cm_no = ?, password = ?, role = ?, status = ?, can_book = ?, fees_status = ?
       WHERE id = ?`,
      [
        String(name || currentUser.name).trim(),
        normalizedUsername,
        normalizedEmail,
        normalizedCmNo,
        nextPassword,
        role || currentUser.role,
        status || currentUser.status,
        can_book || currentUser.can_book,
        fees_status || currentUser.fees_status,
        id,
      ]
    );

    const [updated] = await pool.query(
      `SELECT id, name, username, email, cm_no, role, status, can_book, fees_status, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [id]
    );

    emitRealtime("users:updated", { action: "updated", id: Number(id) });
    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    if (isDuplicateEntryError(error)) {
      return res.status(409).json({ message: "User with this email or username already exists" });
    }
    res.status(500).json({ message: "Failed to update user" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [users] = await pool.query("SELECT id, role FROM users WHERE id = ?", [id]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    emitRealtime("users:updated", { action: "deleted", id: Number(id) });
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
