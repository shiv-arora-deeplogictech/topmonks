const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const generateToken = require('../utils/generateToken');

exports.register = (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.writeHead(400).end(JSON.stringify({ code: 400, message: "Required Fields are missing" }));
    }

    if (password !== confirmPassword) {
        return res.writeHead(429).end(JSON.stringify({ code: 429, message: "Password and confirm password doesn't match." }));
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.writeHead(500).end(JSON.stringify({ code: 500, message: "Server Error" }));

        User.createUser(name, email, hashedPassword, (err, user) => {
            if (err) {
                return res.writeHead(409).end(JSON.stringify({ code: 409, message: "Email already exists" }));
            }
            res.writeHead(201).end(JSON.stringify({ status: "success", message: "User registered successfully", data: { user } }));
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    User.findByEmail(email, (err, user) => {
        if (!user) {
            return res.writeHead(401).end(JSON.stringify({ code: 401, message: "User not registered" }));
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) {
                return res.writeHead(401).end(JSON.stringify({ code: 401, message: "Invalid Credentials" }));
            }

            const token = generateToken(user.id, user.email);
            res.writeHead(200).end(JSON.stringify({ code: 200, message: "Login Successful", token }));
        });
    });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findByEmail(email, (err, user) => {
      if (!user) {
          return res.writeHead(404).end(JSON.stringify({ code: 404, message: "No account found" }));
      }

      // Generate reset token (valid for 15 minutes)
      const resetToken = jwt.sign({ email }, 'reset_secret_key', { expiresIn: '15m' });

      // Store the reset token in the database
      User.updateResetToken(email, resetToken, (err, success) => {
          if (err || !success) {
              return res.writeHead(500).end(JSON.stringify({ code: 500, message: "Failed to update reset token" }));
          }

          res.writeHead(200).end(JSON.stringify({
              code: 200,
              message: "Password reset email sent, check your inbox.",
              token: resetToken
          }));
      });
  });
};

exports.resetPassword = (req, res) => {
    const { token, new_password, confirm_password } = req.body;

    if (!token) return res.writeHead(400).end(JSON.stringify({ code: 400, message: "Missing Token" }));

    if (new_password !== confirm_password) {
        return res.writeHead(429).end(JSON.stringify({ code: 429, message: "Password and confirm password doesn't match." }));
    }

    jwt.verify(token, 'reset_secret_key', (err, decoded) => {
        if (err) return res.writeHead(401).end(JSON.stringify({ code: 401, message: "Invalid Token or Expired Token" }));

        bcrypt.hash(new_password, 10, (err, hashedPassword) => {
            User.resetPassword(token, hashedPassword, (err, success) => {
                if (!success) return res.writeHead(400).end(JSON.stringify({ code: 400, message: "Invalid Token" }));

                res.writeHead(200).end(JSON.stringify({ code: 200, message: "Password reset successfully." }));
            });
        });
    });
};
