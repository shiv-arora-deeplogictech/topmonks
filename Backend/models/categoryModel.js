const db = require("../config/db");

db.run(`
    CREATE TABLE IF NOT EXISTS categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_title TEXT NOT NULL UNIQUE
    )
`);

module.exports = db;
