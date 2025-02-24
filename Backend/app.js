const http = require('http');
const authRoutes = require('./routes/authRoutes');

const server = http.createServer((req, res) => {
    
        if(req.url.startsWith("/auth")){
            authRoutes(req,res);
        }
        else {
            res.writeHead(404).end(JSON.stringify({ code: 404, message: "Not Found" }));
        }
    });

server.listen(3000, () => console.log('Server running on port 3000'));
