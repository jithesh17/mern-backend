const express = require("express");

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadStudentsFromExcel,
} = require("../controllers/studentController");

const uploadExcel = require("../middleware/uploadExcel");

const router = express.Router();

// =====================================================
// CREATE STUDENT
// =====================================================

router.post("/", createStudent);

// =====================================================
// UPLOAD STUDENTS FROM EXCEL
// =====================================================

router.post(
  "/upload-excel",
  uploadExcel.single("file"),
  uploadStudentsFromExcel,
);

// =====================================================
// GET ALL STUDENTS
// =====================================================

router.get("/", getStudents);

// =====================================================
// GET SINGLE STUDENT
// =====================================================

router.get("/:id", getStudentById);

// =====================================================
// UPDATE STUDENT
// =====================================================

router.put("/:id", updateStudent);

// =====================================================
// DELETE STUDENT
// =====================================================

router.delete("/:id", deleteStudent);

module.exports = router;
