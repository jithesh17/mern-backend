
require("dotenv").config();

const express = require("express");
const cors = require("cors");

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
const trainerReportRoutes = require("./routes/trainerReportRoutes");
const batchRoutes = require("./routes/batchRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const protect = require("./middleware/authMiddleware");

// Mail configuration
require("./config/mail");

// ==========================================
// APP INITIALIZATION
// ==========================================
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
// API ROUTES
// ==========================================

// Course APIs
app.use("/api/courses", courseRoutes);

// Trainer APIs
app.use("/api/trainers", trainerRoutes);

// Allocation APIs
app.use("/api/allocations", allocationRoutes);

// MCQ APIs
app.use("/api/mcqs", mcqRoutes);

// Sub Course APIs
app.use("/api/subcourses", subCourseRoutes);

// Student APIs
app.use("/api/students", studentRoutes);

// Student Report APIs
app.use("/api/student-report", studentReportRoutes);

// Trainer Report APIs
app.use("/api/trainer-report", trainerReportRoutes);

// Batch APIs
app.use("/api/batches", batchRoutes);

// Attendance APIs
app.use("/api/attendance", attendanceRoutes);

// ==========================================
// PROTECTED TEST ROUTE
// ==========================================
app.get("/api/protected-test", protect, (req, res) => {
    res.json({
        message: "JWT authentication successful!",
        studentId: req.student.id
    });
});

// ==========================================
// HOME / TEST ROUTE
// ==========================================
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Backend API is running successfully"
    });
});

// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
