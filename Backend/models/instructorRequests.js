const db = require('../config/db');
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS instructor_requests (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
  });

module.exports = db;

