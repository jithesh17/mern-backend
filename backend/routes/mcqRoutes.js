const express = require("express");
const multer = require("multer");
const protect = require("../middleware/authMiddleware");

const {
  createMCQ,
  getAllMCQs,
  getMCQsBySubCourse,
  getMCQById,
  updateMCQ,
  deleteMCQ,
  uploadMCQsFromExcel,
  submitMCQ,
  getMyMCQResults
} = require("../controllers/mcqController");

const router = express.Router();

// ==================================================
// MULTER CONFIGURATION
// ==================================================

const upload = multer({
  storage: multer.memoryStorage(),
});

// ==================================================
// CREATE MCQ
// ==================================================

router.post("/", createMCQ);

// ==================================================
// UPLOAD MCQs FROM EXCEL
// ==================================================

router.post(
  "/upload-excel",
  upload.single("file"),
  uploadMCQsFromExcel
);


router.post("/submit", protect, submitMCQ);

router.get("/my-results", protect, getMyMCQResults);
// ==================================================
// GET ALL MCQs
// ==================================================

router.get("/", getAllMCQs);

// ==================================================
// GET MCQs BY SUB COURSE
// ==================================================

router.get(
  "/subcourse/:subCourseId",
  getMCQsBySubCourse
);

// ==================================================
// GET SINGLE MCQ
// ==================================================

router.get("/:id", getMCQById);

// ==================================================
// UPDATE MCQ
// ==================================================

router.put("/:id", updateMCQ);

// ==================================================
// DELETE MCQ
// ==================================================

router.delete("/:id", deleteMCQ);


module.exports = router;