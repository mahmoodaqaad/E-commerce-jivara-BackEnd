// controllers/authController.js
const db = require('../config/db');
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs');
const salt = 10
// دالة لتسجيل الدخول

const expiresInToken = "1d"

exports.verifyUser = (req, res, next) => {

    // const token = req.headers['authorization']?.split(' ')[1]; // الحصول على التوكن من الرأس
    const token = req.cookies.ecommerce_jivara // الحصول على التوكن من الرأس


    if (!token) {
        return res.status(404).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {

            return res.status(404).json({ message: "Unauthorized", token });
        }
        req.currentUserid = decoded.id
        req.currentUserRoles = decoded.role

        next()
    })
}

exports.login = (req, res) => {

    const { email, password } = req.body;

    // التأكد من عدم وجود حقول فارغة
    if (!email || !password) {
        return res.status(404).json({ message: "All fields are required" });
    }

    // التأكد من صحة صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ message: "Invalid email format" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, data) => {
        if (err) {
            return res.status(404).json({ massage: "one" });
        }
        if (data.length == 0) {
            res.status(400).json({ message: "email is not a vaiedate", status: 205 })

        }
        if (data.length > 0) {
            // compare password  
            bcrypt.compare(password.toString(), data[0].password, (err, response) => {
                if (err) {
                    return res.json({ err: "error in bcrypt" })
                } if (response) {
                    // is true  compare

                    const id = data[0].id;
                    const role = data[0].role;
                    const DateLogin = new Date().toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        // hour12: true, // لتنسيق الساعة بتوقيت 12 ساعة (AM/PM). إذا كنت تفضل توقيت 24 ساعة، يمكنك استخدام false
                    });
                    // new date from login 
                    const newLoginSql = "UPDATE users SET lastLogin= ? WHERE id = ?";
                    db.query(newLoginSql, [DateLogin, id], (err, newdata) => {
                        const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: expiresInToken })

                        return res.json({ message: "User Login successfully", status: 200, Login: true, token, data });


                    })

                }
                else {
                    // is false compare 
                    res.status(404).json({ message: "Wrong Password", status: 205 })
                }
            }
            )


        }
    });
};



// دالة لتسجيل المستخدم
exports.register = (req, res) => {
    const { name, email, password } = req.body;

    // التأكد من عدم وجود حقول فارغة
    if (!name || !email || !password) {
        return res.status(404).json({ message: "All fields are required" });
    }


    const sqlCheck = "SELECT * FROM users WHERE email = ?";

    db.query(sqlCheck, email, (err, data) => {
        if (err) {
            return res.json(err);
        }

        if (data.length > 0) {
            return res.status(404).json({ message: "Email already exists", status: 205 });
        } else {


            bcrypt.hash(password.toString(), salt, (err, hash) => {
                if (err) {
                    return res.json(err)
                }
                const role = req.body.role || 2000;

                const DateCreated = new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    // hour12: true, // لتنسيق الساعة بتوقيت 12 ساعة (AM/PM). إذا كنت تفضل توقيت 24 ساعة، يمكنك استخدام false
                });

                const sqlInsert = "INSERT INTO users (name, email, password, role, DateCreated , lastLogin ,savedProducts) VALUES (? , ? , ? , ? , ?,?,?)";
                db.query(sqlInsert, [name, email, hash, role, DateCreated, DateCreated, "[]"], (err, result) => {
                    if (err) {
                        return res.json(err);
                    }

                    const id = result.insertId;
                    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: expiresInToken });
                    return res.json({ message: "User registered successfully", userId: result.insertId, token, status: 200 });
                });


            })
        }
    });
};

exports.getCurrentUser = (req, res) => {
    const sql = "SELECT id, name, email, role FROM users WHERE id = ?";
    db.query(sql, [req.currentUserid], (err, data) => {
        if (err) {
            return res.json({ error: "Database error", details: err });
        }

        if (data.length > 0) {
            return res.json({ status: 200, user: data[0] });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    });
};



exports.logout = (req, res) => {


    res.cookie("ecommerce_jivara", "", { expires: new Date(0) });
    res.json({ message: "Token deleted successfully" });
}


// changePasword

exports.CahngePass = (req, res) => {

    const { oldPass, newPass } = req.body
    const id = req.currentUserid

    const checkUserSql = "SELECT * FROM users WHERE id = ?"
    db.query(checkUserSql, id, (err, user) => {
        if (err) return res.json("err herder")

        if (user) {
            bcrypt.compare(oldPass.toString(), user[0].password, (err, response) => {
                if (err) return res.json("err compare")
                if (response) {


                    bcrypt.hash(newPass.toString(), salt, (err, hash) => {



                        const UPDATEPASSSQL = "UPDATE users SET password = ? WHERE id = ?"



                        db.query(UPDATEPASSSQL, [hash, id], (err, result) => {

                            if (err) { res.json(err) }
                            if (result) {
                                res.json({ message: "Update Password successfully", status: 200 })
                            }
                        })

                    })

                }
                else {
                    res.status(404).json({ message: "Wrong Password" })

                }
            })




        }

    })




}

