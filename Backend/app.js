const http = require('http');
const authRoutes = require('./routes/authRoutes');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && authRoutes[req.url]) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            req.body = JSON.parse(body);
            authRoutes[req.url](req, res);
        });

    } else {
        res.writeHead(404).end(JSON.stringify({ code: 404, message: "Not Found" }));
    }
});

server.listen(3000, () => console.log('Server running on port 3000'));
