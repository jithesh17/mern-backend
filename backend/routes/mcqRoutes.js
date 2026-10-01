const express = require("express");

const {
  createMCQ,
  getAllMCQs,
  getMCQsBySubCourse,
  getMCQById,
  updateMCQ,
  deleteMCQ,
} = require("../controllers/mcqController");

const router = express.Router();

// Create MCQ
router.post("/", createMCQ);

// Get all MCQs
router.get("/", getAllMCQs);

// Get MCQs for a specific sub course
router.get(
  "/subcourse/:subCourseId",
  getMCQsBySubCourse
);

// Get single MCQ
router.get("/:id", getMCQById);

// Update MCQ
router.put("/:id", updateMCQ);

// Delete MCQ
router.delete("/:id", deleteMCQ);

module.exports = router;