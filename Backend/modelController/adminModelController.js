const db = require('../config/db');

const User = {

    async getAllUsers() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    async deleteUser(userId) {
        return new Promise((resolve, reject) => {
            console.log("Deleting user with ID:", userId);
            db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = User;
