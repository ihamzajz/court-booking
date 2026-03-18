const jwt = require("jsonwebtoken");

const pool = require("../config/db");

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    const [rows] = await pool.query(
      `SELECT id, name, username, email, cm_no, role, status, can_book, fees_status
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account inactive. Contact admin" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

exports.adminOnly = (req, res, next) => {
  const role = req.user?.role;

  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
