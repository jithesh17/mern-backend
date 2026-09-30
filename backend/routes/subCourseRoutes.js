const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  createSubCourse,
  getSubCourses,
  getSubCourseById,
  getSubCoursesByCourse,
  updateSubCourse,
  deleteSubCourse,
} = require("../controllers/subCourseController");

const router = express.Router();

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "image") {
      cb(null, "uploads/subcourses");
    } else if (file.fieldname === "pdf") {
      cb(null, "uploads/subcourse-pdfs");
    } else {
      cb(new Error("Invalid file field"));
    }
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  // Image
  if (file.fieldname === "image") {
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (allowedImageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error("Only JPG, JPEG and PNG images are allowed"));
  }

  // PDF
  if (file.fieldname === "pdf") {
    if (file.mimetype === "application/pdf") {
      return cb(null, true);
    }

    return cb(new Error("Only PDF files are allowed"));
  }

  cb(new Error("Invalid file field"));
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// =====================================================
// SUB COURSE ROUTES
// =====================================================

// CREATE
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  createSubCourse
);

// GET ALL
router.get("/", getSubCourses);

// GET SUB COURSES BY COURSE
router.get("/course/:courseId", getSubCoursesByCourse);


// GET ONE
router.get("/:id", getSubCourseById);



// PUT
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  updateSubCourse
);


// DELETE
router.delete("/:id", deleteSubCourse);

module.exports = router;