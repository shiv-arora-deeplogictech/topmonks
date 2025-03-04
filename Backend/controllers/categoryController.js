const db = require("../models/categoryModel");

const categoryController = {
async getCategories(req, res) {
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM categories", [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });

        if (rows.length === 0) {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ code: 404, message: "No categories found" }));
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
            JSON.stringify({
                code: 200,
                message: "Fetched categories successfully",
                categories: rows.map((row) => ({
                    category_id: row.category_id,
                    category_title: row.category_title,
                })),
            })
        );
    } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: 500, message: err.message }));
    }
},

async createCategory(req, res) {
    try {
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));

        req.on("end", async () => {
            const { category_title } = JSON.parse(body);

            if (!category_title) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 400, message: "Category title is required" }));
            }

            const categoryId = await new Promise((resolve, reject) => {
                db.run(
                    "INSERT INTO categories (category_title) VALUES (?)",
                    [category_title],
                    function (err) {
                        if (err) return reject(err);
                        resolve(this.lastID);
                    }
                );
            });

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({
                    code: 201,
                    message: "Category created successfully",
                    category: { category_id: categoryId, category_title },
                })
            );
        });
    } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: 500, message: err.message }));
    }
}
};
module.exports = categoryController;
