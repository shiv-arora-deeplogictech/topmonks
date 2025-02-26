const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET;

class AuthMiddleware {
    static authenticate(allowedRoles) {
        return (req, res, next) => {
            const authHeader = req.headers['authorization'];
            console.log("Auth Header:", authHeader); // Debugging line

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Unauthorized: No token provided' }));
            }

            const token = authHeader.split(' ')[1];
            console.log("Extracted Token:", token); // Debugging line

            jwt.verify(token, SECRET_KEY, (err, decoded) => {
                if (err) {
                    console.error("JWT Verification Error:", err);
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Forbidden: Invalid token' }));
                }

                console.log("Decoded Token:", decoded); // Debugging line

                if (!decoded || !allowedRoles.includes(decoded.role)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Forbidden: Role not allowed' }));
                }

                req.user = decoded;
                next();
            });
        };
    }
}

module.exports = AuthMiddleware;