const express = require("express");
const cors = require("cors");
require("dotenv").config();
// ==========================================
// DATABASE
// ==========================================
const connectDB = require("./config/db");
// ==========================================
// ROUTES
// ==========================================
const courseRoutes = require("./routes/courseRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const allocationRoutes = require("./routes/allocationRoutes");
const mcqRoutes = require("./routes/mcqRoutes");
const subCourseRoutes = require("./routes/subCourseRoutes");
const studentRoutes = require("./routes/studentRoutes");
const studentReportRoutes = require("./routes/studentReportRoutes");
const protect = require("./middleware/authMiddleware");
require("./config/mail");

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// SERVE UPLOADED FILES
// ==========================================
app.use("/uploads", express.static("uploads"));

// ==========================================
// MONGODB CONNECTION
// ==========================================
connectDB();

// ==========================================
// API ROUTES
// ==========================================

// Course
app.use("/api/courses", courseRoutes);

// Trainer
app.use("/api/trainers", trainerRoutes);

// Allocation
app.use("/api/allocations", allocationRoutes);

// MCQ
app.use("/api/mcqs", mcqRoutes);

// Sub Course
app.use("/api/subcourses", subCourseRoutes);

// Student
app.use("/api/students", studentRoutes);

app.use("/api/student-report", studentReportRoutes);
// ==========================================
// TEST ROUTE
// ==========================================
app.get("/api/protected-test", protect, (req, res) => {
  res.json({
    message: "JWT authentication successful!",
    studentId: req.student.id,
  });
});

// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});