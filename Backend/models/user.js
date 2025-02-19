const db = require('../config/db');

class User {
    static createUser(name, email, hashedPassword, callback) {
        const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        db.run(sql, [name, email, hashedPassword], function (err) {
            callback(err, { id: this.lastID, name, email });
        });
    }

    static findByEmail(email, callback) {
        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
            callback(err, user);
        });
    }

    static updateResetToken(email, token, callback) {
      db.run(
          `UPDATE users SET reset_token = ?, reset_token_expiry = DATETIME('now', '+15 minutes') WHERE email = ?`,
          [token,email],

          function (err) {  // Use a regular function instead of an arrow function
              if (err) {
                  console.error("DB Error:", err);
                  return callback(err, false);
              }
              callback(null, this.changes > 0);  // `this.changes` now works
          }
      );
  }
  

    static resetPassword(token, newPassword, callback) {
        db.run(`UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL  WHERE reset_token = ?`, [newPassword, token], function (err) {
            callback(err, this.changes > 0);
        });
    }
}

module.exports = User;
