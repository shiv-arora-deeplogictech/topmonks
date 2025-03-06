const SECRET_KEY = process.env.JWT_SECRET || "s0m3R@nd0m$tr0nGKeY!";
const jwt = require("jsonwebtoken");
const db = require('../models/user');
const { defaultProfile }=require('../assets/defaultProfile');

const UserModelController = {
     createUser(name, email, hashedPassword, role) {
        return new Promise((resolve, reject) => {
            let profileImg="";
            const sql = `INSERT INTO users (name, email, password, role, profile_img) VALUES (?, ?, ?, ?, ?)`;
            db.run(sql, [name, email, hashedPassword, role, defaultProfile.profile_img], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ id: this.lastID, name, email });
            });
        });
    },

    createInstructor(name, email, hashedPassword) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO instructor_requests (name, email, password) VALUES (?, ?, ?)`;
            db.run(sql, [name, email, hashedPassword], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ id: this.lastID, name, email });
            });
        });
    },

    findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
                if (err) {
                    reject(err); // Reject if there's an error
                } else {
                    resolve(user); // Resolve with the user data
                }
            });
        });
    },
    

    updateResetToken(email, token) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET reset_token = ?, reset_token_expiry = DATETIME('now', '+15 minutes') WHERE email = ?`,
                [token, email],
                function (err) {
                    if (err) {
                        console.error("DB Error:", err);
                        return reject(err);
                    }
                    resolve(this.changes > 0); // Resolving true if update was successful
                }
            );
        });
    },    
  

    resetPassword(token, newPassword) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?`,
                [newPassword, token],
                function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(this.changes > 0); // Resolving true if update was successful
                }
            );
        });
    },

    getUserById(userId){
       return new Promise((resolve,reject)=>{
           db.get(`SELECT * FROM users WHERE id = ?`,[userId],(err,user)=>{
               if(err){
                   reject(err);
               }else{
                   resolve(user);
               }
           });
       });  
    },
     
    async getProfile(req,res){
        try {
            const authHeader = req.headers["authorization"];
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 401, message: "Unauthorized: Missing token" }));
            }

            const token = authHeader.split(" ")[1];

            // Verify Token
            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                console.error("JWT Verification Error:", err);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Forbidden: Invalid token' }));
            }

            // Extract userId from Token
            const userId = decoded.id;
            console.log("User ID:", userId);

            if (!userId) {
                res.writeHead(403, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 403, message: "Forbidden: Invalid token payload" }));
            }
            const userData=await this.getUserById(userId);
            const user={
                name:userData.name,
                email:userData.email,
                role:userData.role,
                profile_img:userData.profile_img
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({code: 200,message:"User Profile",user}));
        } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ code: 500, message: error.message }));
        }
    },

    async updateProfile(req,res){
        try {
            const authHeader = req.headers["authorization"];
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 401, message: "Unauthorized: Missing token" }));
            }

            const token = authHeader.split(" ")[1];

            // Verify Token
            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                console.error("JWT Verification Error:", err);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Forbidden: Invalid token' }));
            }

            // Extract userId from Token
            const userId = decoded.id;
            console.log("User ID:", userId);

            if (!userId) {
                res.writeHead(403, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 403, message: "Forbidden: Invalid token payload" }));
            }
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                const { name, profile_img } = JSON.parse(body);
                const updateFields = {};
                if (name) updateFields.name = name;
                if(profile_img) updateFields.profile_img=profile_img;
                if (!name && !profile_img) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ code: 400, message: "No fields to update" }));
                }
                const fields = Object.keys(updateFields);
                const values = Object.values(updateFields);
        
                const setClause = fields.map((field) => `${field} = ?`).join(", ");
                const query = `UPDATE users SET ${setClause} WHERE id = ?`;
                db.run(query, [...values, userId], function (err) {
                    if (err) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ code: 400, message: "Profile update failed" }));
                    }
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ code: 200, message: "Profile updated successfully" }));
                });
            });
        } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ code: 500, message: error.message }));
        }
    }
    

}

module.exports = UserModelController;
