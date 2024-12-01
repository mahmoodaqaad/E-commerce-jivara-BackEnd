// controllers/authController.js
const db = require('../config/db');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const salt = 10;
const expiresInToken = "1d"; // مدة صلاحية التوكن

exports.verifyUser = (req, res, next) => {
    const token = req.cookies.ecommerce_jivara; // الحصول على التوكن من الكوكيز

    if (!token) {
        return res.status(401).json({ message: "No token provided" }); // تغيير الكود إلى 401
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Unauthorized", error: err.message }); // تغيير الكود إلى 403
        }
        req.currentUserid = decoded.id;
        req.currentUserRoles = decoded.role;
        next();
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" }); // تغيير الكود إلى 400
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" }); // تغيير الكود إلى 400
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "Email not found", status: 205 });
        }

        bcrypt.compare(password.toString(), data[0].password, (err, response) => {
            if (err) {
                return res.status(500).json({ message: "Error in password comparison", error: err });
            }
            if (response) {
                const id = data[0].id;
                const role = data[0].role;
                const DateLogin = new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                });

                const newLoginSql = "UPDATE users SET lastLogin= ? WHERE id = ?";
                db.query(newLoginSql, [DateLogin, id], (err, newdata) => {
                    if (err) {
                        return res.status(500).json({ message: "Error updating login date", error: err });
                    }

                    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: expiresInToken });
                    return res.status(200).json({ message: "User logged in successfully", status: 200, Login: true, token, data });
                });
            } else {
                return res.status(401).json({ message: "Wrong password", status: 205 }); // تغيير الكود إلى 401
            }
        });
    });
};

exports.register = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" }); // تغيير الكود إلى 400
    }

    const sqlCheck = "SELECT * FROM users WHERE email = ?";
    db.query(sqlCheck, email, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (data.length > 0) {
            return res.status(400).json({ message: "Email already exists", status: 205 });
        } else {
            bcrypt.hash(password.toString(), salt, (err, hash) => {
                if (err) {
                    return res.status(500).json({ message: "Error hashing password", error: err });
                }
                const role = req.body.role || 2000;
                const DateCreated = new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                });

                const sqlInsert = "INSERT INTO users (name, email, password, role, DateCreated , lastLogin ,savedProducts) VALUES (? , ? , ? , ? , ?,?,?)";
                db.query(sqlInsert, [name, email, hash, role, DateCreated, DateCreated, "[]"], (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: "Database error", error: err });
                    }

                    const id = result.insertId;
                    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: expiresInToken });
                    return res.status(201).json({ message: "User registered successfully", userId: result.insertId, token, status: 200 });
                });
            });
        }
    });
};

exports.getCurrentUser = (req, res) => {
    const sql = "SELECT id, name, email, role FROM users WHERE id = ?";
    db.query(sql, [req.currentUserid], (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err });
        }

        if (data.length > 0) {
            return res.status(200).json({ status: 200, user: data[0] });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    });
};

exports.logout = (req, res) => {
    res.cookie("ecommerce_jivara", "", { expires: new Date(0) });
    return res.status(200).json({ message: "Token deleted successfully" });
};

exports.CahngePass = (req, res) => {
    const { oldPass, newPass } = req.body;
    const id = req.currentUserid;

    const checkUserSql = "SELECT * FROM users WHERE id = ?";
    db.query(checkUserSql, id, (err, user) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        if (user) {
            bcrypt.compare(oldPass.toString(), user[0].password, (err, response) => {
                if (err) return res.status(500).json({ message: "Error comparing passwords", error: err });
                if (response) {
                    bcrypt.hash(newPass.toString(), salt, (err, hash) => {
                        if (err) return res.status(500).json({ message: "Error hashing new password", error: err });

                        const UPDATEPASSSQL = "UPDATE users SET password = ? WHERE id = ?";
                        db.query(UPDATEPASSSQL, [hash, id], (err, result) => {
                            if (err) {
                                return res.status(500).json({ message: "Error updating password", error: err });
                            }
                            return res.status(200).json({ message: "Password updated successfully", status: 200 });
                        });
                    });
                } else {
                    return res.status(401).json({ message: "Wrong password" });
                }
            });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    });
};
