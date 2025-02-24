const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

class AuthMiddleware {
    static authenticate(allowedRoles) {
        return (req, res, next) => {
            const token = req.headers['authorization']?.split(' ')[1];
            if (!token) return res.end(JSON.stringify({ message: 'Unauthorized' }));

            jwt.verify(token, SECRET_KEY, (err, decoded) => {
                if (err || !allowedRoles.includes(decoded.role)) {
                    return res.end(JSON.stringify({ message: 'Forbidden' }));
                }
                req.user = decoded;
                next();
            });
        };
    }
}

module.exports = AuthMiddleware;