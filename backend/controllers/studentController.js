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
// GET SINGLE STUDENT
// =====================================================

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("course", "course duration logo");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json(student);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE STUDENT - PUT
// =====================================================

const updateStudent = async (req, res) => {
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

    // Check whether the course exists
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const updateData = {
      student,
      course,
      batch,
      startDate,
      status: status || "Active",
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("course", "course duration logo");

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
};
// =====================================================
// DELETE STUDENT
// =====================================================

const deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      deletedStudent: deletedStudent.student,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student",
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
  getStudentById,
  updateStudent,
  deleteStudent,
};