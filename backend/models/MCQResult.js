
const mongoose = require("mongoose");

const mcqResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    subCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCourse",
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    correctAnswers: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    passed: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MCQResult", mcqResultSchema);
