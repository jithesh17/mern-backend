const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
  {
    // Parent Course
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Parent Sub Course
    subCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCourse",
      required: true,
    },

    // Question
    question: {
      type: String,
      required: true,
      trim: true,
    },

    // Four Options
    options: {
      A: {
        type: String,
        required: true,
        trim: true,
      },

      B: {
        type: String,
        required: true,
        trim: true,
      },

      C: {
        type: String,
        required: true,
        trim: true,
      },

      D: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Correct Answer
    correctAnswer: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MCQ", mcqSchema);
