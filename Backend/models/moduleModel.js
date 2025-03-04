const db = require("../config/db");

db.run(`
    CREATE TABLE IF NOT EXISTS modules (
        module_id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_name TEXT NOT NULL,
        course_id INTEGER,
        submodule_id TEXT DEFAULT '[]', -- Stores JSON array of user IDs
        completed INTEGER CHECK (completed IN (0, 1)) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
    )
`);

module.exports = db;
