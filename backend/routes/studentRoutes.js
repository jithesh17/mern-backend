const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadStudentsFromExcel,
  sendPasswordChangeOTP,
  verifyPasswordOTP,
  loginStudent,
  changeStudentPassword,
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
// STUDENT LOGIN
// =====================================================

router.post("/login", loginStudent);

router.post("/send-password-otp", sendPasswordChangeOTP);

router.post("/verify-password-otp", verifyPasswordOTP);

router.post("/change-password", changeStudentPassword);
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
 