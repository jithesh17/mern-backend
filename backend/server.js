const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const courseRoutes = require("./routes/courseRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const allocationRoutes = require("./routes/allocationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/courses", courseRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/allocations", allocationRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

// Database
connectDB();

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});