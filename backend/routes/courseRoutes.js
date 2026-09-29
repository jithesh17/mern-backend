const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  patchCourse,
  deleteCourse,
} = require("../controllers/courseController");

const router = express.Router();

// -------------------------
// MULTER CONFIGURATION
// -------------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/courses");
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

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG and PNG images are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

// -------------------------
// COURSE ROUTES
// -------------------------

// CREATE
router.post("/", upload.single("logo"), createCourse);

// GET ALL
router.get("/", getCourses);

// GET ONE
router.get("/:id", getCourseById);

// PUT
router.put("/:id", upload.single("logo"), updateCourse);

// PATCH
router.patch("/:id", upload.single("logo"), patchCourse);

// DELETE
router.delete("/:id", deleteCourse);

module.exports = router;