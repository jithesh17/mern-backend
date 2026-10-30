const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    student: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Bcrypt hashed password - used for login
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Plain password - visible to Admin and used for welcome email
    plainPassword: {
      type: String,
      required: true,
      minlength: 6,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    batch: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

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