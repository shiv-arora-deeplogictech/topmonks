const db = require('../db');

class InstructorRequest {
    static async getRequestById(user_id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM instructor_requests WHERE request_id = ?', [user_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async approve(user) {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "instructor")',
                [user.name, user.email, user.password], function (err) {
                    if (err) return reject(err);
                    db.run('UPDATE instructor_requests SET status = "approved" WHERE request_id = ?', [user.user_id], function (err) {
                        if (err) reject(err);
                        else resolve();
                    });
             });
        });
    }

    static async reject(user_id) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE instructor_requests SET status = "declined" WHERE request_id = ?', [user_id], function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = InstructorRequest;