const express = require("express");
const mysql = require("mysql2");
const { body, validationResult } = require("express-validator");
const path = require("path");

const app = express();

// Serve static files from public folder
app.use(express.static("public"));

// Handle root route
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database Connection
const db = mysql.createPool({
  host: "mysql.bitwittech.com/",
  user: "bitwittech_initial",
  password: "N}^hCgm9hu,4",
  database: "bitwittech_initial",
});

// Updated Validators
const formValidators = [
  body("full_name")
    .trim()
    .matches(/^[a-zA-Z\s\.]{2,}$/)
    .withMessage("Invalid Name"),

  body("company_name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Company name too short"),

  body("company_pan")
    .toUpperCase()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage("Invalid PAN format"),

  body("gst_no")
    .toUpperCase()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage("Invalid GST format"),

  body("mobile_no")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Invalid Mobile number"),

  body("state").notEmpty().withMessage("State is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("email").isEmail().withMessage("Valid email required"),

  body("turnover")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Turnover detail is required"),

  body("buyer_type")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Buyer type detail is required"),
];

app.post("/submit-form", formValidators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const {
    full_name,
    company_name,
    company_pan,
    gst_no,
    mobile_no,
    state,
    city,
    email,
    turnover,
    buyer_type,
  } = req.body;

  const query = `INSERT INTO companies 
    (full_name, company_name, company_pan, gst_no, mobile_no, state, city, email, turnover, buyer_type) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    full_name,
    company_name,
    company_pan,
    gst_no,
    mobile_no,
    state,
    city,
    email,
    turnover,
    buyer_type,
  ];

  db.execute(query, values, (err, result) => {
    if (err) {
      console.error("SQL Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database Error" });
    }
    res.json({ success: true });
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
