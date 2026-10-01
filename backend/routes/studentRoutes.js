const express = require("express");

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();

// CREATE
router.post("/", createStudent);

// GET ALL
router.get("/", getStudents);

// GET ONE
router.get("/:id", getStudentById);

// UPDATE
router.put("/:id", updateStudent);

// DELETE
router.delete("/:id", deleteStudent);

module.exports = router;