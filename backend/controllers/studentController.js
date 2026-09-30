const Student = require("../models/Student");
const Course = require("../models/Course");

// =====================================================
// CREATE STUDENT
// =====================================================

const createStudent = async (req, res) => {
  try {
    const {
      student,
      course,
      batch,
      startDate,
      status,
    } = req.body;

    // Check required fields
    if (!student || !course || !batch || !startDate) {
      return res.status(400).json({
        message: "Student, course, batch and start date are required",
      });
    }

    // Check whether the selected course exists
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Create student
    const newStudent = await Student.create({
      student,
      course,
      batch,
      startDate,
      status: status || "Active",
    });

    res.status(201).json({
      message: "Student created successfully",
      student: newStudent,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create student",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL STUDENTS
// =====================================================

const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("course", "course duration logo")
      .sort({ createdAt: -1 });

    res.status(200).json(students);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createStudent,
  getStudents,
};