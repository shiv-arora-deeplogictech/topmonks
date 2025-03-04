const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET;
const RESET_SECRET_KEY = process.env.JWT_RESET_SECRET;

const resetTokens = {
generateToken (id, email,name,role)  {
    return jwt.sign({ id, email,name,role }, SECRET_KEY, { expiresIn: '1h' });
},
resetGenerateToken (email) {
    return jwt.sign({ email }, RESET_SECRET_KEY, { expiresIn: '15m' });
}
};

module.exports = resetTokens;
