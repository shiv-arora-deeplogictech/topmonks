const categoryController = require("../controllers/categoryController");

function categoryRoutes(req, res) {
    if (req.method === "POST" && req.url === "/category/createCategory") {
        return categoryController.createCategory(req, res);
    }
    if (req.method === "GET" && req.url.endsWith("/category/getCategories")) { 
        return categoryController.getCategories(req, res);
    }
}

module.exports = categoryRoutes;
