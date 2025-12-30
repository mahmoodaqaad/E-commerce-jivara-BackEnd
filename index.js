const express = require('express');
const cors = require("cors");
require('dotenv').config();
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL, // مثال: https://e-commerce-9c449.web.app
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Static files
app.use(express.static('public'));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Preflight requests for all routes
app.options('*', cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Client URL:', process.env.CLIENT_URL);
});
