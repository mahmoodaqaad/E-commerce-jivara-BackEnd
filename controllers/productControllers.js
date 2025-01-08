const db = require('../config/db')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const crypto = require('crypto'); // استيراد وحدة crypto
const { all } = require('../routes/userRoutes');

const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, "public/image")
    }
    ,
    filename: (req, file, cd) => {
        cd(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})



exports.upload = multer({
    storage: storage
})

const url = "https://e-commerce-jivara-backend-hl0c.onrender.com/image";

exports.addProduct = (req, res) => {


    // const images = req.files.map(file => `${url}/${file.filename}`)
    const images = req.body.images

    const { category, discrption, price, title, stok } = req.body.form
    // return res.json({ category, discrption, price, title, stok , images })
    // get cate name
    const cateSql = "SELECT name FROM categories WHERE id = ?"
    const created = new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        // hour12: true,  // لتنسيق الساعة بتوقيت 12 ساعة (AM/PM). إذا كنت تفضل توقيت 24 ساعة، يمكنك استخدام false
    });

    db.query(cateSql, category, (err, data) => {
        if (err) return res.status(400).json(err)

        if (data) {
            const rating = 0
            const rating_avarage = 0
            const total_rate_value = 0
            const category_name = data[0].name
            const sql = "INSERT INTO products ( title, discrption, price, category_id, category_name, stok , created,rating, rating_avarage, total_rate_value, user_id_rate, user_comments, images ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"

            db.query(sql, [title, discrption, price, category, category_name, stok, created, rating, rating_avarage, total_rate_value, "[]", "[]", JSON.stringify(images)], (err, data) => {

                if (err) return res.status(404).json(err)
                if (data) res.json({


                    message: "succes"
                })

            })
        }

    })

}



exports.products = (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const filter = req.query.filter || "title";
    const order = req.query.order || "ASC";


    const offset = (page - 1) * limit;


    const sql = `SELECT * FROM products WHERE title LIKE ? ORDER BY ${filter} ${order} LIMIT ?, ? `;

    db.query(sql, [`%${search}%`, offset, limit], (err, data) => {
        if (err) return res.json(err)
        if (data) {
            const countSQL = `SELECT COUNT (*) AS total FROM products WHERE title LIKE ? ORDER BY ${filter} ${order}`
            db.query(countSQL, [`%${search}%`], (countErr, countData) => {

                if (countErr) return res.json(countErr);
                const total = countData[0].total

                res.json({
                    data: data,
                    total
                })

            })


        }

    })



}

exports.deleteProduct = (req, res) => {
    const { id } = req.params


    const getSql = "SELECT images FROM products WHERE id = ? "

    db.query(getSql, [id], (err, data) => {
        if (err) return res.json("err")
        if (data.length > 0) {
            const images = data.length > 0 ? JSON.parse(data[0].images) : []
            const newImages = images.map(item => item.replace(`${url}/`, ""))
            try {

                newImages.map(item => {

                    fs.unlinkSync(path.join(__dirname, '../public/image', item)); // حذف الصورة من المجلد

                })
            } catch (e) {
            }

            const sql = "DELETE FROM products WHERE id = ?"
            db.query(sql, id, (err, data) => {
                if (err) return res.status(400).json({ message: err });

                res.status(200).json({ message: 'Product Delete  successfully' });
            });
        }
    })



}

exports.getOneProduct = (req, res, next) => {
    const { id } = req.params

    const sql = "SELECT * FROM products WHERE id = ?"
    db.query(sql, id, (err, data) => {

        if (err) res.json(err)

        if (data) {
            req.dataProduct = data
            // res.json({ data })

            next()
        }
    })
}

exports.product = (req, res) => {

    res.json({ data: req.dataProduct })
}



exports.deleteImgProduct = (req, res) => {
    const { id } = req.params
    const { fullimage, image } = req.body
    try {

        fs.unlinkSync(path.join(__dirname, '../public/image', image)); // حذف الصورة من المجلد
    } catch (e) {

    }

    const oldImage = JSON.parse(req.dataProduct[0].images)

    const updateImage = oldImage.filter(item => item !== fullimage)

    const updateSQL = "UPDATE products SET  images = ? WHERE id = ?";
    db.query(updateSQL, [JSON.stringify(updateImage), id], (err, response) => {
        if (err) return res.json(err)
        if (response) {
            res.json({ mess: "seccuss" })
        }
    })



}

exports.EditProduct = (req, res) => {

    const { id } = req.params
    const { category, discrption, price, title, stok } = JSON?.parse(req.body.form)

    const cateSql = "SELECT name FROM categories WHERE id = ?"

    db.query(cateSql, category, (err, data) => {
        if (err) return res.status(400).json(err)

        if (data) {

            const category_name = data[0].name
            if (req.files.length > 0) {

                const newImages = req.files.map(file => `${url}/${file.filename}`);
                const oldImage = JSON.parse(req.dataProduct[0].images)

                const updateImage = [...oldImage, ...newImages]




                const UPDATESQL = "UPDATE products SET title=?, discrption=?, price=?, category_id=?, category_name=?, stok= ?, images = ? WHERE id = ?"
                db.query(UPDATESQL, [title, discrption, price, category, category_name, stok, JSON.stringify(updateImage), id], (err, respone) => {
                    if (err) return res.json(err)
                    res.json({ stok, file: req.files, message: 'Product updated successfully 4' });

                })


            }
            else {


                const UPDATESQL = "UPDATE products SET title=?, discrption=?, price=?, category_id=?, category_name=?, stok= ? WHERE id = ?"
                db.query(UPDATESQL, [title, discrption, price, category, category_name, stok, id], (err, respone) => {
                    if (err) return res.json(err)
                    res.json({ message: 'Product updated successfully 2' });

                })
            }
        }
    })

}

// comments


// add comment

exports.addComments = (req, res) => {
    const { id } = req.params
    const comment = [{
        id: crypto.randomUUID(),
        commet: req.body.addcomment,
        user: req.body.CurrentUser,
        date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }),
    }]

    const updateCommentsQuery = "UPDATE products SET `user_comments` = ? WHERE id = ?";

    if (req.dataProduct[0].user_comments) {

        const oldcomments = Array.from(JSON.parse(req.dataProduct[0].user_comments))
        const updateComments = [...oldcomments, ...comment]

        db.query(updateCommentsQuery, [JSON.stringify(updateComments), id], (err, result) => {

            if (err) return res.json(err)
            res.json({ message: 'Add commets successfully 2' });



        })
    }
    else {
        db.query(updateCommentsQuery, [JSON.stringify(comment), id], (err, result) => {

            if (err) return res.json(err)
            res.json({ message: 'Add commets successfully 2' });



        })
    }


}

exports.deleteComment = (req, res) => {

    const comment = req.body.comment
    const { id } = req.params
    const oldcomments = Array.from(JSON.parse(req.dataProduct[0].user_comments))
    const updateComments = oldcomments.filter(item => (item.id != comment.id))

    const updateCommentsQuery = "UPDATE products SET `user_comments` = ? WHERE id = ?";
    db.query(updateCommentsQuery, [JSON.stringify(updateComments), id], (err, result) => {

        if (err) return res.json(err)
        res.json({ message: 'Delete commets successfully ' });



    })
}

exports.addrate = (req, res) => {
    const { id } = req.params

    let alluser = req.dataProduct[0].total_rate_value
    let avarge = req.dataProduct[0].rating_avarage
    let total = req.dataProduct[0].rating
    let userId = req.dataProduct[0].user_id_rate ? JSON.parse(req.dataProduct[0].user_id_rate) : []
    if (req.body.user) {
        userId.push(req.body.user)
        total = total + Number(req.body.star)
        alluser += 1
        avarge = (Number(total) / Number(alluser)).toFixed(1)

        const updateCommentsQuery = "UPDATE products SET total_rate_value= ? , rating_avarage =?, rating = ?,user_id_rate=?  WHERE id = ?";

        db.query(updateCommentsQuery, [alluser, avarge, total, JSON.stringify(userId), id], (err, result) => {

            res.json({ avarge, total, alluser, userId, message: 'new commets successfully ', id })
            if (err) return res.json(err)



        })

    }

}


// uitls

exports.getTopRatedProducts = (req, res) => {
    const sql = `SELECT * FROM products ORDER BY rating_avarage DESC LIMIT 5`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(400).json({ message: "Error fetching top rated products", error: err });
        }
        res.json({
            message: "Top rated products fetched successfully",
            data: results,
        });
    });
};



exports.getLatestProducts = (req, res) => {
    const sql = `SELECT * FROM products ORDER BY created DESC LIMIT 8`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(400).json({ message: "Error fetching latest products", error: err });
        }
        res.json({
            message: "Latest products fetched successfully",
            data: results,
        });
    });
};

exports.getTileProductSearch = (req, res) => {


    const search = req.query.search || "";

    const sql = `SELECT id, title FROM products WHERE title LIKE ? `;

    db.query(sql, [`%${search}%`], (err, data) => {
        if (err) return res.json(err)
        if (data) {
            const countSQL = `SELECT COUNT (*) AS total FROM products WHERE title LIKE ?`
            db.query(countSQL, [`%${search}%`], (countErr, countData) => {

                if (countErr) return res.json(countErr);
                const total = countData[0].total

                res.json({
                    data: data,
                })
            })
        }

    })
};