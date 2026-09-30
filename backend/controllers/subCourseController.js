const SubCourse = require("../models/SubCourse");
const Course = require("../models/Course");

// =====================================================
// CREATE SUB COURSE
// =====================================================

const createSubCourse = async (req, res) => {
  try {
    const {
      course,
      sub,
      description,
      notes,
    } = req.body;

    if (!course || !sub || !description) {
      return res.status(400).json({
        message: "Course, sub course and description are required",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const newSubCourse = await SubCourse.create({
      course,
      sub,
      description,
      notes: notes || "",

      image: req.files?.image
        ? `/uploads/subcourses/${req.files.image[0].filename}`
        : "",

      pdf: req.files?.pdf
        ? `/uploads/subcourse-pdfs/${req.files.pdf[0].filename}`
        : "",
    });

    res.status(201).json({
      message: "Sub course created successfully",
      subCourse: newSubCourse,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create sub course",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL SUB COURSES
// =====================================================

const getSubCourses = async (req, res) => {
  try {
    const subCourses = await SubCourse.find()
      .populate("course", "course duration logo")
      .sort({ createdAt: -1 });

    res.status(200).json(subCourses);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sub courses",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE SUB COURSE
// =====================================================

const getSubCourseById = async (req, res) => {
  try {
    const subCourse = await SubCourse.findById(req.params.id)
      .populate("course", "course duration logo");

    if (!subCourse) {
      return res.status(404).json({
        message: "Sub course not found",
      });
    }

    res.status(200).json(subCourse);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sub course",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE SUB COURSE - PUT
// =====================================================

const updateSubCourse = async (req, res) => {
  try {
    const {
      course,
      sub,
      description,
      notes,
    } = req.body;

    if (!course || !sub || !description) {
      return res.status(400).json({
        message: "Course, sub course and description are required",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const updateData = {
      course,
      sub,
      description,
      notes: notes || "",
    };

    if (req.files?.image) {
      updateData.image =
        `/uploads/subcourses/${req.files.image[0].filename}`;
    }

    if (req.files?.pdf) {
      updateData.pdf =
        `/uploads/subcourse-pdfs/${req.files.pdf[0].filename}`;
    }

    const updatedSubCourse = await SubCourse.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("course", "course duration logo");

    if (!updatedSubCourse) {
      return res.status(404).json({
        message: "Sub course not found",
      });
    }

    res.status(200).json({
      message: "Sub course updated successfully",
      subCourse: updatedSubCourse,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update sub course",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE SUB COURSE
// =====================================================

const deleteSubCourse = async (req, res) => {
  try {
    const deletedSubCourse = await SubCourse.findByIdAndDelete(
      req.params.id
    );

    if (!deletedSubCourse) {
      return res.status(404).json({
        message: "Sub course not found",
      });
    }

    res.status(200).json({
      message: "Sub course deleted successfully",
      deletedSubCourse: deletedSubCourse.sub,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete sub course",
      error: error.message,
    });
  }
};

// =====================================================
// GET SUB COURSES BY COURSE
// =====================================================

const getSubCoursesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check whether the course exists
    const existingCourse = await Course.findById(courseId);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Find all sub courses belonging to this course
    const subCourses = await SubCourse.find({
      course: courseId,
    })
      .populate("course", "course duration logo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      course: existingCourse.course,
      count: subCourses.length,
      subCourses,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sub courses for this course",
      error: error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createSubCourse,
  getSubCoursesByCourse,
  getSubCourses,
  getSubCourseById,
  updateSubCourse,
  deleteSubCourse,
};