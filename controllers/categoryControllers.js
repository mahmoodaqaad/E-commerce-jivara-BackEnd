
const db = require('../config/db')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = "https://e-commerce-jivara-backend-hl0c.onrender.com/category/"

const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, "public/category")
    }
    ,
    filename: (req, file, cd) => {
        cd(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))

    }
})

exports.upload = multer({
    storage: storage
})

exports.addCategory = (req, res) => {

    // const image = `${http}${req.file.filename}`
    const image = req.body.image
    const { name } = req.body
    const created = new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        // hour12: true,  // لتنسيق الساعة بتوقيت 12 ساعة (AM/PM). إذا كنت تفضل توقيت 24 ساعة، يمكنك استخدام false
    });

    const sql = "INSERT INTO categories (name ,created,image) VALUES ( ?,?,?)"

    db.query(sql, [name, created, image], (err, response) => {

        if (err) return res.json(err)

        if (response) return res.json({ message: "Add Product Seccussfully" })

    })


} 
exports.Categories = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10000;
    const search = req.query.search || "";
    const filter = req.query.filter || "name";
    const order = req.query.order || "ASC";
    const offset = (page - 1) * limit;

    const sql = `SELECT * FROM categories WHERE name LIKE ? ORDER BY ${filter} ${order} LIMIT ?, ? `

    db.query(sql, [`%${search}%`, offset, limit], (err, data) => {


        if (err) return res.json(err)

        if (data) {

            const countSQL = `SELECT COUNT (*) AS total FROM categories WHERE name LIKE ? ORDER BY ${filter} ${order}`
            db.query(countSQL, [`%${search}%`], (countErr, countData) => {

                if (countErr) return res.json(countErr);
                const total = countData[0].total

                res.json({
                    data,
                    total
                })

            })


        }

    })





}

exports.getoneCategory = (req, res, next) => {
    const { id } = req.params

    const sql = "SELECT * FROM categories WHERE id = ?"
    db.query(sql, id, (err, data) => {

        if (err) res.json(err)

        if (data.length > 0) {
            req.dataCate = data
            // res.json({ data })

            next()
        }
    })
}

exports.category = (req, res) => {

    res.json({ data: req.dataCate })
}

exports.deleteCategory = (req, res) => {

    const { id } = req.params

    const image = req.dataCate[0].image
    const imgFile = image.replace(http, "")
    try {

        fs.unlinkSync(path.join(__dirname, "../Public/category", imgFile))
    } catch (e) {
    }

    const sql = "DELETE FROM categories WHERE id = ?"
    db.query(sql, [id], (err, data) => {

        if (err) res.json(err)

        if (data) {
            res.json({ message: "successfully Deleted" })
        }

    })


}

exports.editCategory = (req, res) => {
    const { id } = req.params

    const { name } = req.body
    if (req.file) {
        const newimage = `${http}${req.file.filename}`
        console.log(newimage);

        const oldimage = req.dataCate[0].image
        const imgFile = oldimage.replace(http, "")
        try {

            fs.unlinkSync(path.join(__dirname, '../public/category', imgFile))
        } catch (e) {
        }


        const updateSql = "UPDATE categories SET name =? ,image=? WHERE id = ?"
        db.query(updateSql, [name, newimage, id], (err, result) => {

            if (err) res.json(err)

            if (result) {
                res.json({ message: "successfully Updated" })
            }

        })

    }
    else {

        const updateSql = "UPDATE categories SET name =?  WHERE id = ?"
        db.query(updateSql, [name, id], (err, result) => {

            if (err) res.json(err)

            if (result) {
                res.json({ message: "successfully Updated" })
            }

        })


    }

}