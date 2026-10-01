const Course = require("../models/Course");

// CREATE COURSE
const createCourse = async (req, res) => {
  try {
    const { course, duration } = req.body;

    if (!course || !duration) {
      return res.status(400).json({
        message: "Course and duration are required",
      });
    }

    const newCourse = await Course.create({
      course,
      duration,
      logo: req.file ? `/uploads/courses/${req.file.filename}` : "",
    });

    res.status(201).json({
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// GET ALL COURSES
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

// GET SINGLE COURSE
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course",
      error: error.message,
    });
  }
};

// UPDATE COURSE - PUT
const updateCourse = async (req, res) => {
  try {
    const { course, duration } = req.body;

    const updateData = {
      course,
      duration,
    };

    if (req.file) {
      updateData.logo = `/uploads/courses/${req.file.filename}`;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update course",
      error: error.message,
    });
  }
};
  
// PATCH COURSE
const patchCourse = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.course !== undefined) {
      updateData.course = req.body.course;
    }

    if (req.body.duration !== undefined) {
      updateData.duration = req.body.duration;
    }

    if (req.file) {
      updateData.logo = `/uploads/courses/${req.file.filename}`;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json({
      message: "Course patched successfully",
      course: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to patch course",
      error: error.message,
    });
  }
};


// DELETE COURSE + ITS SUB COURSES
const deleteCourse = async (req, res) => {
  try {
    // Find the course first
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Find all sub courses belonging to this course
    const subCourses = await SubCourse.find({
      course: req.params.id,
    });

    // Get their names before deleting
    const deletedSubCourses = subCourses.map(
      (subCourse) => subCourse.sub
    );

    // Delete all related sub courses
    await SubCourse.deleteMany({
      course: req.params.id,
    });

    // Delete the parent course
    await Course.findByIdAndDelete(req.params.id);

  
    res.status(200).json({
      message: "Course deleted successfully",
      deletedCourse: course.course,
      deletedSubCourses: deletedSubCourses,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete course",
      error: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  patchCourse,
  deleteCourse,
};
