const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET;
const RESET_SECRET_KEY = process.env.JWT_RESET_SECRET;


const generateToken = (id, email) => {
    return jwt.sign({ id, email }, 'your_secret_key', { expiresIn: '1h' });
};

module.exports = generateToken;
