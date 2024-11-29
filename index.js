// app.js
const express = require('express');
const cors = require("cors");
require('dotenv').config();

const userRoutes = require('./routes/userRoutes'); // استيراد طرق المستخدم
const app = express()
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.static('public'))

const PORT = 8081
app.use(cors({
    origin: [process.env.CLIENT_URL],
    methods: ["POST", "GET", "DELETE", "PATCH"],
    credentials: true
}));
console.log(process.env);

app.use(express.json());

app.use(userRoutes); // استخدام طرق المستخدم

app.listen(PORT, () => {
    console.log(process.env.CLIENT_URL);
});

