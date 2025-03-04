const db = require("../config/db");

db.run(`
    CREATE TABLE IF NOT EXISTS questions (
        question_id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER NOT NULL,
        question_title TEXT NOT NULL,
        options TEXT DEFAULT '[]' , -- JSON stringified array
        correct_ans TEXT DEFAULT '[]', -- JSON stringified array
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE
    )
`);

module.exports = db;
