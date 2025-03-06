const { defaultProfile } = require('../assets/defaultProfile');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const InstructorRequest = {

    async getAllPending() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM instructor_requests WHERE status = "pending"', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    
    async getRequestById(user_id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM instructor_requests WHERE request_id = ?', [user_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    async approve(user_id,user) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return new Promise((resolve, reject) => {
            
            db.run('INSERT INTO users (name, email, password, role, profile_img) VALUES (?, ?, ?, "instructor", ?)',
                [user.name, user.email, hashedPassword,defaultProfile.profile_img], function (err) {
                    if (err) return reject(err);
                    db.run('UPDATE instructor_requests SET status = "approved" WHERE request_id = ?', [user_id], function (err) {
                        if (err) reject(err);
                        else resolve();
                    });
             });
        });
    },

    async reject(user_id) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE instructor_requests SET status = "rejected" WHERE request_id = ?', [user_id], function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    },
}

module.exports = InstructorRequest;