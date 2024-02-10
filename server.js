const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const { db, createUsersTable } = require("./database");

const app = express();

const port = 4000;
app.use(cors());

createUsersTable();
app.use(bodyParser.json());

// Signup API
app.post("/signup", async (req, res) => {
  const { username, password, age, dob, contact } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { username, password: hashedPassword, age, dob, contact };
  console.log(user);
  db.query("INSERT INTO users SET?", user, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: err });
    } else {
      res.status(201).json({ message: "User registered successfully" });
    }
  });
});

// Login API
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ?",
    username,
    async (err, result) => {
      if (err || result.length === 0) {
        res.status(401).json({ message: "Invalid username or password" });
      } else {
        const match = await bcrypt.compare(password, result[0].password);
        if (!match) {
          res.status(401).json({ message: "Invalid username or password" });
        } else {
          const token = jwt.sign(
            { username: result[0].username },
            "secret_key"
          );
          res.status(200).json({ token });
        }
      }
    }
  );
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    res.status(403).json({ message: "Token not provided" });
  } else {
    jwt.verify(token, "secret_key", (err, decoded) => {
      if (err) {
        res.status(401).json({ message: "Invalid token" });
      } else {
        req.username = decoded.username;
        next();
      }
    });
  }
};

// Get user details API
app.get("/profile", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM users WHERE username = ?",
    req.username,
    (err, result) => {
      if (err || result.length === 0) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json(result[0]);
      }
    }
  );
});

// Edit user details API
app.put("/profile", verifyToken, (req, res) => {
  const { age, dob, contact } = req.body;
  const updatedUser = { age, dob, contact };
  db.query(
    "UPDATE users SET ? WHERE username = ?",
    [updatedUser, req.username],
    (err, result) => {
      if (err) {
        res.status(500).json({ message: "Failed to update user details" });
      } else {
        res.status(200).json({ message: "User details updated successfully" });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
