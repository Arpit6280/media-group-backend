const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "node-complete",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to MySQL database");
});

const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      age INT,
      dob VARCHAR(255),
      contact VARCHAR(255)
    )
  `;
  db.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    console.log("Users table created or already exists");
  });
};

module.exports = { db, createUsersTable };
