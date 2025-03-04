const db = require("../config/db");

db.run(`
  CREATE TABLE IF NOT EXISTS submodules (
        submodule_id INTEGER PRIMARY KEY AUTOINCREMENT,
        submodule_name TEXT NOT NULL,
        submodule_description TEXT,
        module_id INTEGER,
        video TEXT, -- Stores video link
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    )
`);

module.exports = db;
