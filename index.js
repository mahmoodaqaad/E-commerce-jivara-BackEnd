// app.js
const express = require('express');
const cors = require("cors");
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.static('public'));

const PORT =  8081; // استخدم متغير البيئة PORT إذا كان موجودًا

app.use(cors({
    origin: [process.env.CLIENT_URL], // تأكد من صحة عنوان URL
    methods: ["POST", "GET", "DELETE", "PATCH"],
    credentials: true
}));

app.use(express.json());

app.use(userRoutes); // استخدام طرق المستخدم

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Client URL:', process.env.CLIENT_URL);
});
