
const mysql = require("mysql2");
const con = mysql.createConnection({
    host: "localhost",
    database: "Admin_pannel",
    port: 3306,
    user: "root",
    password: ""
});
con.connect((error) => {
    if (error) throw error;
    console.log("Connected to database");
});
module.exports = con;