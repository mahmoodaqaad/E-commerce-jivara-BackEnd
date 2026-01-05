// app.js
const express = require('express');
const cors = require("cors");
require('dotenv').config();

const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 8081;
app.use(express.static('public'));
app.use('/categories', express.static('public/categories'));
app.use('/products', express.static('public/products'));

app.use(cors({
    origin: [process.env.CLIENT_URL], // تأكد من صحة عنوان URL
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"],
    credentials: true
}));

app.use(express.json());

app.use(userRoutes); // استخدام طرق المستخدم

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Client URL:', process.env.CLIENT_URL);
});