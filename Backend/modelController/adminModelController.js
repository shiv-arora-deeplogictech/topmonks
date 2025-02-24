const db = require('../config/db');

class Role {
    static async getAllRoles() {
        return new Promise((resolve, reject) => {
            db.all('SELECT DISTINCT role FROM users', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async deleteRole(roleName) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE users SET role = NULL WHERE role = ?', [roleName], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = Role;
