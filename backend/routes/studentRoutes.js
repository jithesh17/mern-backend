const express = require("express");

const {
  createStudent,
  getStudents,
} = require("../controllers/studentController");

const router = express.Router();

// CREATE
router.post("/", createStudent);

// GET ALL
router.get("/", getStudents);

module.exports = router;