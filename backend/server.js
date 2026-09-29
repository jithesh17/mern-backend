const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const courseRoutes = require("./routes/courseRoutes");
const trainerRoutes = require("./routes/trainerRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/courses", courseRoutes);
app.use("/api/trainers", trainerRoutes);

connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
