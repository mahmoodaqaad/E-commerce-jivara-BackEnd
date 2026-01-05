const multer = require('multer');
const path = require('path');
const db = require('../config/db')





// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const AuthControllers = require('../controllers/AuthControllers');
const userControllers = require('../controllers/userControllers');
const productControllers = require('../controllers/productControllers');
const categoryControllers = require("../controllers/categoryControllers")
// تعريف الطرق

// Auth 
const numOfProduct = 10
router.post("/register", AuthControllers.register);
router.post("/login", AuthControllers.login);

router.get("/logout", AuthControllers.verifyUser, AuthControllers.logout);

router.get("/user", AuthControllers.verifyUser, AuthControllers.getCurrentUser);

router.post("/CahngePass", AuthControllers.verifyUser, AuthControllers.CahngePass);

// user 
router.post("/user/add", userControllers.adduser);
router.get("/users", userControllers.users);
router.get("/user/:id", AuthControllers.verifyUser, userControllers.getUser);

router.patch("/user/update/:id", AuthControllers.verifyUser, userControllers.updateUser); // إضافة مسار تعديل المستخدم
router.put("/user/myUpdateUser/:id", AuthControllers.verifyUser, userControllers.myUpdateUser); // إضافة مسار تعديل المستخدم
router.delete("/user/delete/:id", AuthControllers.verifyUser, userControllers.deleteUser); // إضافة مسار حذف المستخدم


router.post("/updateSave", AuthControllers.verifyUser, userControllers.updateSave);


router.get("/savedPrdouct", AuthControllers.verifyUser, userControllers.SavedProduct);






// product
router.get('/product/topRated', productControllers.getTopRatedProducts)
router.get('/product/latest', productControllers.getLatestProducts)
router.get('/searchProduct', productControllers.getTileProductSearch)

// add 
// router.post('/product/add', productControllers.upload.array('images', 10), productControllers.addProduct)
router.post('/product/add', productControllers.addProduct)
// edit 
router.post('/product/edit/:id', productControllers.upload.array('images', 10), productControllers.getOneProduct, productControllers.EditProduct)
// get all 
router.get('/products', productControllers.products)
// delete product 
router.delete('/product/delete/:id', productControllers.deleteProduct)
// get one 
router.get('/product/:id', productControllers.getOneProduct, productControllers.product)
// delete img 
router.post('/product/delete-img/:id', productControllers.getOneProduct, productControllers.deleteImgProduct)



// Comment


router.post('/product/add-comment/:id', productControllers.getOneProduct, productControllers.addComments)
router.post('/product/delete-comment/:id', productControllers.getOneProduct, productControllers.deleteComment)


// rating 
router.post('/product/add-rate/:id', productControllers.getOneProduct, productControllers.addrate)




// catygory

// router.post("/category/add", categoryControllers.upload.single("image"), categoryControllers.addCategory)
router.post("/category/add", categoryControllers.addCategory)

router.post("/category/edit/:id", categoryControllers.getoneCategory, categoryControllers.upload.single("image"), categoryControllers.editCategory)

router.get("/categories", categoryControllers.Categories)
router.get("/category/:id", categoryControllers.getoneCategory, categoryControllers.category)




router.delete("/category/delete/:id", categoryControllers.getoneCategory, categoryControllers.deleteCategory)

module.exports = router;
