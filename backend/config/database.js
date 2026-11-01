const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "word_scramble"
});

// const db = mysql.createPool({
//    host: process.env.DB_HOST,
//    user: process.env.DB_USER,
//    password: process.env.DB_PASSWORD,
//    database: process.env.DB_NAME
// });

db.getConnection((error, connection) => {
    if (error) {
        console.error("Database connection failed:", error.message);
        return;
    }

    console.log("MySQL database connected!");

    connection.release();
});

module.exports = db;