const MCQ = require("../models/MCQ");
const Course = require("../models/Course");
const SubCourse = require("../models/SubCourse");

// ==================================================
// CREATE MCQ
// ==================================================

const createMCQ = async (req, res) => {
  try {
    const {
      course,
      subCourse,
      question,
      options,
      correctAnswer,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (
      !course ||
      !subCourse ||
      !question ||
      !options ||
      !correctAnswer
    ) {
      return res.status(400).json({
        message: "All MCQ fields are required",
      });
    }

    // -----------------------------
    // Check Course
    // -----------------------------

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // -----------------------------
    // Check Sub Course
    // -----------------------------

    const existingSubCourse = await SubCourse.findById(
      subCourse
    );

    if (!existingSubCourse) {
      return res.status(404).json({
        message: "Sub course not found",
      });
    }

    // Make sure subcourse belongs to selected course
    if (
      existingSubCourse.course.toString() !==
      course.toString()
    ) {
      return res.status(400).json({
        message:
          "Selected sub course does not belong to selected course",
      });
    }

    // -----------------------------
    // Validate Options
    // -----------------------------

    if (
      !options.A ||
      !options.B ||
      !options.C ||
      !options.D
    ) {
      return res.status(400).json({
        message: "All four options are required",
      });
    }

    // -----------------------------
    // Create MCQ
    // -----------------------------

    const mcq = await MCQ.create({
      course,
      subCourse,
      question,
      options,
      correctAnswer,
    });

    res.status(201).json({
      message: "MCQ created successfully",
      mcq,
    });
  } catch (error) {
    console.error("Create MCQ Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// GET ALL MCQs
// ==================================================

const getAllMCQs = async (req, res) => {
  try {
    const mcqs = await MCQ.find()
      .populate("course", "course")
      .populate("subCourse", "sub")
      .sort({ createdAt: -1 });

    res.status(200).json(mcqs);
  } catch (error) {
    console.error("Get MCQs Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// GET MCQs BY SUB COURSE
// ==================================================

const getMCQsBySubCourse = async (req, res) => {
  try {
    const { subCourseId } = req.params;

    const mcqs = await MCQ.find({
      subCourse: subCourseId,
    })
      .populate("course", "course")
      .populate("subCourse", "sub")
      .sort({ createdAt: 1 });

    res.status(200).json(mcqs);
  } catch (error) {
    console.error(
      "Get MCQs By SubCourse Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// GET SINGLE MCQ
// ==================================================

const getMCQById = async (req, res) => {
  try {
    const { id } = req.params;

    const mcq = await MCQ.findById(id)
      .populate("course", "course")
      .populate("subCourse", "sub");

    if (!mcq) {
      return res.status(404).json({
        message: "MCQ not found",
      });
    }

    res.status(200).json(mcq);
  } catch (error) {
    console.error("Get MCQ Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// UPDATE MCQ
// ==================================================

const updateMCQ = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      course,
      subCourse,
      question,
      options,
      correctAnswer,
    } = req.body;

    const existingMCQ = await MCQ.findById(id);

    if (!existingMCQ) {
      return res.status(404).json({
        message: "MCQ not found",
      });
    }

    // -----------------------------
    // Check Course
    // -----------------------------

    if (course) {
      const existingCourse =
        await Course.findById(course);

      if (!existingCourse) {
        return res.status(404).json({
          message: "Course not found",
        });
      }
    }

    // -----------------------------
    // Check Sub Course
    // -----------------------------

    if (subCourse) {
      const existingSubCourse =
        await SubCourse.findById(subCourse);

      if (!existingSubCourse) {
        return res.status(404).json({
          message: "Sub course not found",
        });
      }

      const selectedCourse =
        course || existingMCQ.course;

      if (
        existingSubCourse.course.toString() !==
        selectedCourse.toString()
      ) {
        return res.status(400).json({
          message:
            "Selected sub course does not belong to selected course",
        });
      }
    }

    // -----------------------------
    // Update
    // -----------------------------

    existingMCQ.course =
      course || existingMCQ.course;

    existingMCQ.subCourse =
      subCourse || existingMCQ.subCourse;

    existingMCQ.question =
      question || existingMCQ.question;

    existingMCQ.options =
      options || existingMCQ.options;

    existingMCQ.correctAnswer =
      correctAnswer || existingMCQ.correctAnswer;

    await existingMCQ.save();

    res.status(200).json({
      message: "MCQ updated successfully",
      mcq: existingMCQ,
    });
  } catch (error) {
    console.error("Update MCQ Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// DELETE MCQ
// ==================================================

const deleteMCQ = async (req, res) => {
  try {
    const { id } = req.params;

    const mcq = await MCQ.findById(id);

    if (!mcq) {
      return res.status(404).json({
        message: "MCQ not found",
      });
    }

    await MCQ.findByIdAndDelete(id);

    res.status(200).json({
      message: "MCQ deleted successfully",
    });
  } catch (error) {
    console.error("Delete MCQ Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createMCQ,
  getAllMCQs,
  getMCQsBySubCourse,
  getMCQById,
  updateMCQ,
  deleteMCQ,
};