const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    // Student requesting the password change
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // Store a hash of the OTP, not the actual OTP
    otpHash: {
      type: String,
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },

    // OTP expiration time
    expiresAt: {
      type: Date,
      required: true,
    },

    // Number of incorrect verification attempts
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Automatically remove expired OTP documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);
