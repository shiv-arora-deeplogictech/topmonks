const db = require('../config/db');



//////// Connected to the SQLite database.
// home/deep/Projects/topmonks/topmonks/Backend/models/user.js:7
// callback(err, { id: this.lastID, name, email });


// TypeError: callback is not a function


class User {
    static createUser(name, email, hashedPassword, role) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
            db.run(sql, [name, email, hashedPassword, role], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ id: this.lastID, name, email });
            });
        });
    }

    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
                if (err) {
                    reject(err); // Reject if there's an error
                } else {
                    resolve(user); // Resolve with the user data
                }
            });
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
