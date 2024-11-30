// config/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.port
});

db.connect((err) => {
    if (err) {
        console.error('Err on data base ' + err.stack);
        return;
    }
    console.log('sucssefflly database' + db.threadId);
});

module.exports = db;
