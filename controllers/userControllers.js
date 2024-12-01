// controllers/userController.js
const db = require('../config/db');
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs');


exports.adduser = (req, res) => {
    const { name, email, password, role } = req.body

    const checkUserSql = "SELECT * FROM users WHERE email = ?"
    db.query(checkUserSql, email, (err, data) => {
        if (err) return res.json({ error: err, message: "Error IN select User for data base" })
        if (data.length > 0) {

            return res.status(404).json({ message: "This User is Already Exist" })
        } else {


            bcrypt.hash(password.toString(), 10, (err, hash) => {
                if (err) return res.json({ error: err, message: "Error IN hash" })
                if (hash) {



                    const DateCreated = new Date().toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        // hour12: true,  // لتنسيق الساعة بتوقيت 12 ساعة (AM/PM). إذا كنت تفضل توقيت 24 ساعة، يمكنك استخدام false
                    });


                    const sql = "INSERT INTO users (name , email , password , role , DateCreated,savedProducts) VALUES (? , ? , ? , ? , ? , ? )"
                    db.query(sql, [name, email, hash, role, DateCreated, "[]"], (err, result) => {
                        if (err) return res.status(404).json({ error: err, message: "Error IN data base" })
                        if (result) {
                            return res.json({ message: "add user successfully", status: 200 })
                        }
                    })
                }

            })


        }

    })

}


// دالة لجلب جميع المستخدمين
exports.users = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10000;
    const search = req.query.search || "";
    const filter = req.query.filter || "name";
    const order = req.query.order || "ASC";// استلام قيمة البحث من المعامل search

    const offset = (page - 1) * limit;

    const sql = `SELECT * FROM users WHERE name LIKE ? ORDER BY ${filter} ${order} LIMIT ?, ?`;
    db.query(sql, [`%${search}%`, offset, limit], (err, data) => {
        if (err) return res.json(err)

        if (data) {

            const countSQL = `SELECT COUNT (*) AS total FROM users WHERE name LIKE ? ORDER BY ${filter} ${order}`
            db.query(countSQL, [`%${search}%`], (countErr, countData) => {

                if (countErr) return res.json(countErr);
                const total = countData[0].total

                res.json({
                    data,
                    total
                })

            })

        }
    });
};

// دالة لجلب معلومات دالة واحدة
exports.getUser = (req, res) => {
    const sql = "SELECT * FROM users WHERE id = ?";
    const { id } = req.params;

    db.query(sql, id, (err, data) => {
        if (err) {
            return res.json("error");
        }
        return res.json(data);
    });
};



exports.updateUser = (req, res) => {
    const { name, email, role } = req.body;
    const { id } = req.params;

    // Check for required fields
    if (!name || !email || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Validate username as email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }


    // Check user role
    if (req.currentUserRoles !== "1990") {
        return res.status(403).json({ message: "Access denied. Only admins can update user data." });
    }

    // Current user email check
    const sqlCheckCurrentUser = "SELECT email ,role FROM users WHERE id = ?";
    db.query(sqlCheckCurrentUser, id, (err, result) => {
        if (err) return res.status(500).json({ message: "Error in server", error: err });
        const currentUsername = result[0]?.email;
        // If the email has changed
        if (currentUsername && currentUsername !== email) {
            const sqlCheckEmail = "SELECT * FROM users WHERE email = ?";
            db.query(sqlCheckEmail, [email], (errEmail, emailData) => {
                if (errEmail) return res.status(500).json({ message: "Error in server", error: errEmail });

                if (emailData.length > 0) {
                    return res.status(400).json({ message: "Email already exists", status: 205 });
                }

                // Update user if the new email is unused
                const sqlUpdate = "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?";
                db.query(sqlUpdate, [name, email, role, id], (errUpdate) => {
                    if (errUpdate) return res.status(500).json({ message: "Error in server", error: errUpdate });
                    return res.json({ message: "User updated successfully", result: result });
                });
            });
        }


        else {
            // Update user without changing email
            const sqlUpdate = "UPDATE users SET name = ?, role = ? WHERE id = ?";
            db.query(sqlUpdate, [name, role, id], (errUpdate) => {
                if (errUpdate) return res.status(500).json({ message: "Error in server", error: errUpdate });
                return res.json({ message: "User updated successfully", result: result, status: 200 });
            });
        }
    });
};

// دالة لحذف المستخدم
exports.deleteUser = (req, res) => {

    // res.json(req.currentUserRoles)
    // Check user role
    if (!req.currentUserRoles == "1990") {
        return res.status(403).json({ message: "Access denied. Only admins can update user data." });
    }
    const { id } = req.params;
    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, id, (err, data) => {
        if (err) {
            return res.json(err);
        }
        if (data) {

            res.json({ message: "Delete User successfully" })
        }
    });

};

exports.updateSave = (req, res) => {

    const id = req.currentUserid
    const saved = req.body.savedProduct
    const type = req.body.type
    const getAllSaved = "SELECT savedProducts FROM users WHERE id = ? "

    db.query(getAllSaved, id, (err, data) => {
        if (err) return res.json(err)
        // res.json({ id, saved })
        if (data) {
            const savedServer = data[0].savedProducts ? JSON.parse(data[0].savedProducts) : []

            if (type) {

                const savedServer = data[0].savedProducts ? JSON.parse(data[0].savedProducts) : []

                let newData = [...savedServer, saved]



                const sql = "UPDATE users SET savedProducts = ? WHERE id = ? "
                db.query(sql, [JSON.stringify(newData), id], (err, data) => {
                    if (err) return res.json(err)

                    res.json({ message: "successfully saved", newx: newData })

                })
            }

            else {


                let newData = savedServer.filter(item => +item.id !== +saved.id)

                const sql = "UPDATE users SET savedProducts = ? WHERE id = ? "
                db.query(sql, [JSON.stringify(newData), id], (err, data) => {
                    if (err) return res.json(err)

                    res.json({ message: "successfully saved", oldx: newData })

                })

            }

        }
    })
}







exports.SavedProduct = (req, res) => {

    const id = req.currentUserid
    const sql = "SELECT savedProducts FROM users WHERE id = ? "
    db.query(sql, id, (err, data) => {
        if (err) return res.json(err)

        const savedServer = data[0].savedProducts ? JSON.parse(data[0].savedProducts) : []
        res.json({ data: savedServer, id })

    })

}