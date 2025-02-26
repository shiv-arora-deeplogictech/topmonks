const http = require('http');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');


const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allows requests from any origin
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed methods
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers

        if (req.method === 'OPTIONS') {
            res.writeHead(204); // No Content
            return res.end();
        }
        
        if(req.url.startsWith("/auth")){
            authRoutes(req,res);
        }
        else if (req.url.startsWith("/admin")) {
            adminRoutes(req, res);
        }
        else {
            res.writeHead(404).end(JSON.stringify({ code: 404, message: "Not Found and main" }));
        }
    });

server.listen(3000, () => console.log('Server running on port 3000'));
