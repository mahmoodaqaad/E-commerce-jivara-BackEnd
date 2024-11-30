// config/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: "dpg-ct5g7nilqhvc73a8on70-a",
    user: "root",
    password: "7sw7CSGDqKSySfsoj8YFj6KSaAv4vMHc",
    database: "ecommerce_jivara",
    port: 5432
});

db.connect((err) => {
    if (err) {
        console.error('Err on data base ' + err.stack);
        return;
    }
    console.log('sucssefflly database' + db.threadId);
});

module.exports = db;
