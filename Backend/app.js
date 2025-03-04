const https = require("https");
const categoryRoutes = require("./routes/categoryRoutes");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const fs=require('fs');
const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};
const server = https.createServer(options,(req, res) => {
    // Set CORS Headers
    
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Content-Type","application/json" );

    // Handle Preflight Request (OPTIONS)
    if (req.method === "OPTIONS") {
        res.setHeader("status", 204); // No Content
        return res.end();
    }

    // Route Handling
    if (req.url.startsWith("/user")) {
        return userRoutes(req, res); // Handle user-related routes
    } 
    
    if (req.url.startsWith("/instructor")) {
        return instructorRoutes(req, res); // Handle instructor separately
    }

    if(req.url.startsWith("/course")){
        return courseRoutes(req,res);
    }

    if(req.url.startsWith("/category")){
        return categoryRoutes(req,res);
      }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route Not Found" }));
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});