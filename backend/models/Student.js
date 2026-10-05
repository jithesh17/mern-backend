const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // Student Name
    student: {
      type: String,
      required: true,
      trim: true,
    },

    // Password
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Course
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Batch
    batch: {
      type: String,
      required: true,
      trim: true,
    },

    // Start Date
    startDate: {
      type: Date,
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);