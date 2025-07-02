const mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Test the connection and log errors or success
connection.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err.message);
    } else {
        console.log('MySQL connected successfully!');
    }
});

module.exports = connection;