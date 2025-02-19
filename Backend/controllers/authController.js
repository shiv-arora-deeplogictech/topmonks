const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const generateToken = require('../utils/generateToken');

// Utility function to parse request body
const getRequestBody = (req, callback) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk.toString(); });

    req.on("end", () => {
        try {
            callback(null, JSON.parse(body));
        } catch (error) {
            callback(error, null);
        }
    });
};

// Register user
const register = (req, res) => {
    getRequestBody(req, (err, body) => {
        if (err) {
            res.writeHead(400);
            return res.end(JSON.stringify({ code: 400, message: "Invalid JSON format" }));
        }

        const { name, email, password, confirmPassword } = body;

        if (!name || !email || !password || !confirmPassword) {
            res.writeHead(400);
            return res.end(JSON.stringify({ code: 400, message: "Required Fields are missing" }));
        }

        if (password !== confirmPassword) {
            res.writeHead(429);
            return res.end(JSON.stringify({ code: 429, message: "Passwords do not match." }));
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ code: 500, message: "Server Error" }));
            }

            User.createUser(name, email, hashedPassword, (err, user) => {
                if (err) {
                    res.writeHead(409);
                    return res.end(JSON.stringify({ code: 409, message: "Email already exists" }));
                }

                res.writeHead(201);
                res.end(JSON.stringify({ status: "success", message: "User registered successfully", data: { user } }));
            });
        });
    });
};

// Login user
const login = (req, res) => {
    getRequestBody(req, (err, body) => {
        if (err) {
            res.writeHead(400);
            return res.end(JSON.stringify({ code: 400, message: "Invalid JSON format" }));
        }

        const { email, password } = body;

        User.findByEmail(email, (err, user) => {
            if (!user) {
                res.writeHead(401);
                return res.end(JSON.stringify({ code: 401, message: "User not registered" }));
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (!isMatch) {
                    res.writeHead(401);
                    return res.end(JSON.stringify({ code: 401, message: "Invalid Credentials" }));
                }

                const token = generateToken(user.id, user.email, user.role);
                res.writeHead(200);
                res.end(JSON.stringify({ code: 200, message: "Login Successful", token }));
            });
        });
    });
};

// Forgot Password
const forgotPassword = (req, res) => {
    getRequestBody(req, (err, body) => {
        if (err) {
            res.writeHead(400);
            return res.end(JSON.stringify({ code: 400, message: "Invalid JSON format" }));
        }

        const { email } = body;

        User.findByEmail(email, (err, user) => {
            if (!user) {
                res.writeHead(404);
                return res.end(JSON.stringify({ code: 404, message: "No account found" }));
            }

            const resetToken = jwt.sign({ email }, 'reset_secret_key', { expiresIn: '15m' });

            User.updateResetToken(email, resetToken, (err, success) => {
                if (err || !success) {
                    res.writeHead(500);
                    return res.end(JSON.stringify({ code: 500, message: "Failed to update reset token" }));
                }

                res.writeHead(200);
                res.end(JSON.stringify({ code: 200, message: "Password reset email sent.", token: resetToken }));
            });
        });
    });
};

// Reset Password
const resetPassword = (req, res) => {
    getRequestBody(req, (err, body) => {
        if (err) {
            res.writeHead(400);
            return res.end(JSON.stringify({ code: 400, message: "Invalid JSON format" }));
        }

        const { token, new_password, confirm_password } = body;

        if (!token) {
            res.writeHead(400);
            return res.end(JSON.stringify({ code: 400, message: "Missing Token" }));
        }

        if (new_password !== confirm_password) {
            res.writeHead(429);
            return res.end(JSON.stringify({ code: 429, message: "Passwords do not match." }));
        }

        jwt.verify(token, 'reset_secret_key', (err, decoded) => {
            if (err) {
                res.writeHead(401);
                return res.end(JSON.stringify({ code: 401, message: "Invalid or Expired Token" }));
            }

            bcrypt.hash(new_password, 10, (err, hashedPassword) => {
                User.resetPassword(token, hashedPassword, (err, success) => {
                    if (!success) {
                        res.writeHead(400);
                        return res.end(JSON.stringify({ code: 400, message: "Invalid Token" }));
                    }

                    

                    res.writeHead(200);
                    res.end(JSON.stringify({ code: 200, message: "Password reset successfully." }));
                });
            });
        });
    });
};

module.exports = { register, login, resetPassword, forgotPassword };
