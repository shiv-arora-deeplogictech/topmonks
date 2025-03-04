const db = require("../config/db");

db.run(`
    CREATE TABLE IF NOT EXISTS courses (
        course_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_title TEXT NOT NULL,
        course_description TEXT NOT NULL,
        instructor_img TEXT, -- Stores the URL or path of the instructor image
        status INTEGER DEFAULT 1, -- 0: Inactive, 1: Active
        thumbnail TEXT, -- Stores the URL or path of the course image
        category_id INTEGER NOT NULL,
        quiz_id INTEGER, -- Stores the ID of the associated quiz
        instructor_id INTEGER NOT NULL,
        instructor TEXT NOT NULL,
        designation TEXT NOT NULL,
        duration REAL NOT NULL,
        progress REAL DEFAULT 0, -- Stores the course progress in percentage
        no_of_modules INTEGER DEFAULT 0,
        enrolled TEXT DEFAULT '[]', -- Stores JSON array of user IDs
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(category_id),
        FOREIGN KEY (instructor_id) REFERENCES users(user_id)
    )
`);

module.exports = db;