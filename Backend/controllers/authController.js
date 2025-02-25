const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../modelController/userModelController');
const generateToken = require('../utils/generateToken');

const db =require('../config/db');



// Utility function to parse request body
const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => { body += chunk.toString(); });
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
    });
};

// Register user
const userRegister = async (req, res) => {
    try {
        const body = await getRequestBody(req);
        const { name, email, password, confirmPassword } = body;

        if (!name || !email || !password || !confirmPassword) {
            res.writeHead(400);
            return res.end(JSON.stringify({ code: 400, message: "Required Fields are missing" }));
        }

        if (password !== confirmPassword) {
            res.writeHead(429);
            return res.end(JSON.stringify({ code: 429, message: "Passwords do not match." }));
        }
        const role="user";
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.createUser(name, email, hashedPassword,role);

        res.writeHead(201);
        res.end(JSON.stringify({ status: "success", message: "User registered successfully", data: { user } }));
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ code: 500, message: error.message }));
    }
};

//Register Instructor
const instructorRegister = async (req, res) => {
    try {
        const body = await getRequestBody(req);
        const { name, email, password, confirmPassword } = body;

        if (!name || !email || !password || !confirmPassword) {
            res.writeHead(400);
            return res.end(JSON.stringify({ code: 400, message: "Required Fields are missing" }));
        }

        if (password !== confirmPassword) {
            res.writeHead(429);
            return res.end(JSON.stringify({ code: 429, message: "Passwords do not match." }));
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.createInstructor(name, email, hashedPassword);

        res.writeHead(201);
        res.end(JSON.stringify({ status: "success", message: "Instructor Request sent successfully", data: { user } }));
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ code: 500, message: error.message }));
    }
};

// Login user
const login = async (req, res) => {
    try {
        const body = await getRequestBody(req);
        const { email, password } = body;

        const user = await User.findByEmail(email);
        if (!user) {
            res.writeHead(401);
            return res.end(JSON.stringify({ code: 401, message: "User not registered" }));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.writeHead(401);
            return res.end(JSON.stringify({ code: 401, message: "Invalid Credentials" }));
        }

        const token = generateToken(user.id, user.email, user.name, user.role);
        res.writeHead(200);
        res.end(JSON.stringify({ code: 200, message: "Login Successful", token }));
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ code: 500, message: error.message }));
    }
};

const adminLogin = async (req, res) => {
    try {
        const body = await getRequestBody(req);
        const { email, password } = body;

        db.get('SELECT * FROM users WHERE email = ? AND role = "admin"', [email], (err, user) => {
            if (err || !user) {
                return res.writeHead(401).end(JSON.stringify({ message: 'Invalid credentials or not an admin' }));
            }

            if (user.password !== password) {
                return res.writeHead(401).end(JSON.stringify({ message: 'Invalid credentials' }));
            }

            // Generate JWT token
            const token = generateToken(user.id, user.email, user.name, user.role);
            res.writeHead(200);
            res.end(JSON.stringify({ code: 200, message: "Login Successful", token }));
        });
    }
    catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ code: 500, message: error.message }));
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const body = await getRequestBody(req);
        const { email } = body;

        const user = await User.findByEmail(email);
        if (!user) {
            res.writeHead(404);
            return res.end(JSON.stringify({ code: 404, message: "No account found" }));
        }

        const resetToken = jwt.sign({ email }, 'reset_secret_key', { expiresIn: '15m' });
        await User.updateResetToken(email, resetToken);

        res.writeHead(200);
        res.end(JSON.stringify({ code: 200, message: "Password reset email sent.", token: resetToken }));
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ code: 500, message: error.message }));
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const body = await getRequestBody(req);
        const { token, new_password, confirm_password } = body;

        if (!token) {
            res.writeHead(400);
            return res.end(JSON.stringify({ code: 400, message: "Missing Token" }));
        }

        if (new_password !== confirm_password) {
            res.writeHead(429);
            return res.end(JSON.stringify({ code: 429, message: "Passwords do not match." }));
        }

        const decoded = jwt.verify(token, 'reset_secret_key');
        const hashedPassword = await bcrypt.hash(new_password, 10);

        const success = await User.resetPassword(token, hashedPassword);
        if (!success) {
            res.writeHead(400);
            return res.end(JSON.stringify({ code: 400, message: "Invalid Token" }));
        }

        res.writeHead(200);
        res.end(JSON.stringify({ code: 200, message: "Password reset successfully." }));
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ code: 500, message: error.message }));
    }
};

module.exports = { userRegister, login, resetPassword, forgotPassword , instructorRegister, adminLogin};
