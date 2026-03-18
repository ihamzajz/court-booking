const pool = require("../config/db");

const ensureAuthTables = async () => {
  await pool.query(`
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
    )
  `);
};

module.exports = {
  ensureAuthTables,
};
