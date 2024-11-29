// config/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ecommerce-jivara"
});

db.connect((err) => {
    if (err) {
        console.error('Err on data base ' + err.stack);
        return;
    }
    console.log('sucssefflly database' + db.threadId);
});

module.exports = db;
