const mongoose = require("mongoose");

const studentReportSchema = new mongoose.Schema(
  {
    student: {
      type: String,
      required: true,
    },

    course: {
      type: String,
      required: true,
    },

    studentBatch: {
      type: String,
      required: true,
    },

    trainer: {
      type: String,
      default: "-",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Active", "Completed", "Dropped"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudentReport", studentReportSchema);
