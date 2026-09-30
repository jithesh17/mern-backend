const mongoose = require("mongoose");

const subCourseSchema = new mongoose.Schema(
  {
    // Parent Course
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Sub Course Name
    sub: {
      type: String,
      required: true,
      trim: true,
    },

    // Description
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Learning Notes
    notes: {
      type: String,
      default: "",
    },

    // Sub Course Image
    image: {
      type: String,
      default: "",
    },

    // PDF Study Material
    pdf: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SubCourse", subCourseSchema);