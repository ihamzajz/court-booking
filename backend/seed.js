const bcrypt = require("bcryptjs");
const pool = require("./config/db");

const seedAdmin = async () => {
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);

    await pool.query(
      `INSERT INTO users (name, username, email, cm_no, password, role, status, can_book, fees_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         cm_no = VALUES(cm_no),
         password = VALUES(password),
         role = VALUES(role),
         status = VALUES(status),
         can_book = VALUES(can_book),
         fees_status = VALUES(fees_status)`,
      [
        "admin",
        "admin",
        "admin@gmail.com",
        null,
        passwordHash,
        "admin",
        "active",
        "yes",
        "paid",
      ]
    );

    console.log("Admin user seeded successfully.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedAdmin();
