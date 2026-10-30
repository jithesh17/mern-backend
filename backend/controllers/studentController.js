const Student = require("../models/Student");
const Course = require("../models/Course");
const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const OTP = require("../models/OTP");
const transporter = require("../config/mail");
const sendWelcomeEmail = require("../utils/sendWelcomeEmail");
const jwt = require("jsonwebtoken");

const generateTemporaryPassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";

  let password = "";

  for (let i = 0; i < 8; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return password;
};

// =====================================================
// CREATE STUDENT
// =====================================================

const createStudent = async (req, res) => {
  try {
    const { student, email, password, course, batch, startDate, status } =
      req.body;

    // ==========================================
    // REQUIRED FIELDS
    // ==========================================

    if (!student || !email || !course || !batch || !startDate) {
      return res.status(400).json({
        message: "Student, email, course, batch and start date are required",
      });
    }

    // ==========================================
    // CLEAN EMAIL
    // ==========================================

    const cleanEmail = email.toLowerCase().trim();

    // ==========================================
    // CHECK DUPLICATE EMAIL
    // ==========================================

    const existingStudent = await Student.findOne({
      email: cleanEmail,
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "A student with this email already exists",
      });
    }

    // ==========================================
    // CHECK COURSE
    // ==========================================

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // ==========================================
    // PASSWORD
    // ==========================================

    let plainPassword;

    // If Admin provided a password, use it
    if (password && password.trim() !== "") {
      plainPassword = password.trim();

      if (plainPassword.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }
    }

    // If Admin did not provide a password,
    // automatically generate one
    else {
      plainPassword = generateTemporaryPassword();
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // ==========================================
    // CREATE STUDENT
    // ==========================================

    const newStudent = await Student.create({
      student: student.trim(),
      email: cleanEmail,

      // Bcrypt password
      password: hashedPassword,

      // Actual password for Admin/email
      plainPassword: plainPassword,

      course,
      batch,
      startDate,
      status: status || "Active",
    });

    // =================================================
// SEND WELCOME EMAIL
// =================================================

let emailSent = true;

try {
  await sendWelcomeEmail({
    studentName: newStudent.student,
    email: newStudent.email,
    password: newStudent.plainPassword,
    courseName: existingCourse.course,
  });
} catch (emailError) {
  emailSent = false;

  console.error(
    `Welcome email failed for ${newStudent.email}:`,
    emailError.message
  );
}

    // ==========================================
    // RESPONSE
    // ==========================================

return res.status(201).json({
  message: emailSent
    ? "Student created successfully and welcome email sent"
    : "Student created successfully, but welcome email could not be sent",

  emailSent,

  student: {
    _id: newStudent._id,
    student: newStudent.student,
    email: newStudent.email,
    plainPassword: newStudent.plainPassword,
    course: newStudent.course,
    batch: newStudent.batch,
    startDate: newStudent.startDate,
    status: newStudent.status,
  },
});
  } catch (error) {
    console.error("Create student error:", error);

    return res.status(500).json({
      message: "Failed to create student",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL STUDENTS
// =====================================================

const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("course", "course duration logo")
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    console.error("Get students error:", error);

    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE STUDENT
// =====================================================

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "course",
      "course duration logo",
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Get student error:", error);

    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE STUDENT
// =====================================================

const updateStudent = async (req, res) => {
  try {
    const { student, email, password, course, batch, startDate, status } =
      req.body;

    // Required fields
    if (!student || !email || !course || !batch || !startDate) {
      return res.status(400).json({
        message: "Student, email, course, batch and start date are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check course
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Check duplicate email
    const existingStudent = await Student.findOne({
      email: cleanEmail,
      _id: { $ne: req.params.id },
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Another student is already using this email",
      });
    }

    const updateData = {
      student: student.trim(),
      email: cleanEmail,
      course,
      batch,
      startDate,
      status: status || "Active",
    };

    // Password is optional while editing
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).populate("course", "course duration logo");

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: {
        _id: updatedStudent._id,
        student: updatedStudent.student,
        email: updatedStudent.email,
        course: updatedStudent.course,
        batch: updatedStudent.batch,
        startDate: updatedStudent.startDate,
        status: updatedStudent.status,
      },
    });
  } catch (error) {
    console.error("Update student error:", error);

    res.status(500).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE STUDENT
// =====================================================

const deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      deletedStudent: deletedStudent.student,
    });
  } catch (error) {
    console.error("Delete student error:", error);

    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
};

// =====================================================
// UPLOAD STUDENTS FROM EXCEL
// =====================================================

const uploadStudentsFromExcel = async (req, res) => {
  try {
    // -------------------------------------------------
    // Check file
    // -------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an Excel file",
      });
    }

    // -------------------------------------------------
    // Read Excel
    // -------------------------------------------------

    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
      cellDates: false,
      raw: false,
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return res.status(400).json({
        message: "Excel file does not contain any sheet",
      });
    }

    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
    });

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Excel file is empty",
      });
    }

    const insertedStudents = [];
    const failedStudents = [];

    // =================================================
    // PROCESS ROWS
    // =================================================

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Excel first data row = row 2
      const excelRowNumber = i + 2;

      // -------------------------------------------------
      // Read Excel values
      // -------------------------------------------------

      const studentName = String(row.student || "").trim();

      const email = String(row.email || "")
        .trim()
        .toLowerCase();

      const excelPassword = String(row.password || "").trim();

      const courseName = String(row.course || "").trim();

      const batch = String(row.batch || "").trim();

      const startDate = row.startDate;

      const status = String(row.status || "Active").trim();

      // -------------------------------------------------
      // Required fields
      // -------------------------------------------------

      if (!studentName || !email || !courseName || !batch || !startDate) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName || "Unknown",
          reason:
  "Student, email, course, batch and startDate are required",
        });

        continue;
      }

      // -------------------------------------------------
      // Password validation
      // -------------------------------------------------

      // =================================================
      // PASSWORD
      // =================================================

      let plainPassword;

      // Excel contains password
      if (excelPassword !== "") {
        plainPassword = excelPassword;

        // Validate provided password
        if (plainPassword.length < 6) {
          failedStudents.push({
            row: excelRowNumber,
            student: studentName,
            reason: "Password must be at least 6 characters",
          });

          continue;
        }
      }

      // Excel password is empty
      // Generate password automatically
      else {
        plainPassword = generateTemporaryPassword();
      }
      // -------------------------------------------------
      // Status validation
      // -------------------------------------------------

      if (!["Active", "Completed"].includes(status)) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName,
          reason: "Status must be either Active or Completed",
        });

        continue;
      }

      // -------------------------------------------------
      // Check duplicate email
      // -------------------------------------------------

      const existingStudent = await Student.findOne({
        email,
      });

      if (existingStudent) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName,
          reason: `Email "${email}" already exists`,
        });

        continue;
      }

      // -------------------------------------------------
      // Find course
      // -------------------------------------------------

      const escapedCourseName = courseName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      const existingCourse = await Course.findOne({
        course: {
          $regex: `^${escapedCourseName}$`,
          $options: "i",
        },
      });

      if (!existingCourse) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName,
          reason: `Course "${courseName}" not found`,
        });

        continue;
      }

      // =================================================
      // DATE CONVERSION
      // =================================================

      let formattedDate = null;

      // -------------------------------------------------
      // String date
      // -------------------------------------------------

      if (typeof startDate === "string") {
        const dateText = startDate.trim();

        // DD-MM-YYYY
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateText)) {
          const [day, month, year] = dateText.split("-").map(Number);

          formattedDate = new Date(Date.UTC(year, month - 1, day));
        }

        // YYYY-MM-DD
        else if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
          const [year, month, day] = dateText.split("-").map(Number);

          formattedDate = new Date(Date.UTC(year, month - 1, day));
        }

        // DD/MM/YYYY
        else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateText)) {
          const [day, month, year] = dateText.split("/").map(Number);

          formattedDate = new Date(Date.UTC(year, month - 1, day));
        }
      }

      // -------------------------------------------------
      // Excel serial number
      // -------------------------------------------------
      else if (typeof startDate === "number") {
        const excelDate = XLSX.SSF.parse_date_code(startDate);

        if (excelDate) {
          formattedDate = new Date(
            Date.UTC(excelDate.y, excelDate.m - 1, excelDate.d),
          );
        }
      }

      // -------------------------------------------------
      // Validate date
      // -------------------------------------------------

      if (!formattedDate || isNaN(formattedDate.getTime())) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName,
          reason: "Invalid startDate. Use DD-MM-YYYY format.",
        });

        continue;
      }

      // =================================================
      // HASH PASSWORD
      // =================================================

      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // =================================================
      // CREATE STUDENT
      // =================================================

      try {
  const newStudent = await Student.create({
    student: studentName,
    email: email,

    // Bcrypt password
    password: hashedPassword,

    // Actual password
    plainPassword: plainPassword,

    course: existingCourse._id,
    batch: batch,
    startDate: formattedDate,
    status: status,
  });

  // =================================================
  // SEND WELCOME EMAIL
  // =================================================

  let emailSent = true;
  let emailErrorMessage = "";

  try {
    await sendWelcomeEmail({
      studentName: newStudent.student,
      email: newStudent.email,
      password: newStudent.plainPassword,
      courseName: existingCourse.course,
    });

    console.log(
      `Welcome email sent successfully to ${newStudent.email}`
    );
  } catch (emailError) {
    emailSent = false;
    emailErrorMessage = emailError.message;

    console.error(
      `Welcome email failed for ${newStudent.email}:`,
      emailError.message
    );
  }

  // =================================================
  // ADD TO INSERTED STUDENTS
  // =================================================

  insertedStudents.push({
    row: excelRowNumber,
    student: newStudent.student,
    email: newStudent.email,
    emailSent: emailSent,
    emailError: emailErrorMessage,
  });

} catch (studentError) {
  failedStudents.push({
    row: excelRowNumber,
    student: studentName,
    reason: studentError.message,
  });
}
    }

    // =================================================
    // FINAL RESPONSE
    // =================================================

    return res.status(200).json({
      message: "Excel processing completed",
      totalRows: rows.length,
      inserted: insertedStudents.length,
      failed: failedStudents.length,
      insertedStudents,
      failedStudents,
    });
  } catch (error) {
    console.error("Excel upload error:", error);

    return res.status(500).json({
      message: "Failed to process Excel file",
      error: error.message,
    });
  }
};
// =====================================================
// STUDENT LOGIN
// =====================================================


const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const student = await Student.findOne({
      email: cleanEmail,
    }).populate("course", "course duration logo");

    if (!student) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      student.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token after successful login
    const token = jwt.sign(
      {
        id: student._id,
        role: "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      student: {
        _id: student._id,
        student: student.student,
        email: student.email,
        course: student.course,
        batch: student.batch,
        startDate: student.startDate,
        status: student.status,
      },
    });
  } catch (error) {
    console.error("Student login error:", error);

    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const sendPasswordChangeOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Registered email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find the student account
    const student = await Student.findOne({
      email: cleanEmail,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student account not found",
      });
    }

    // Enforce a 60-second resend cooldown
    const recentOTP = await OTP.findOne({
      student: student._id,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });

    if (recentOTP) {
      return res.status(429).json({
        message: "Please wait 60 seconds before requesting another OTP",
      });
    }

    // Generate a secure six-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash the OTP before saving it
    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // Expire after five minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate any previous OTP for this student
    await OTP.deleteMany({ student: student._id });

    // Save the new OTP record
    await OTP.create({
      student: student._id,
      otpHash,
      expiresAt,
      attempts: 0,
    });

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: student.email,
        subject: "BR Academy - Password Change OTP",
        text: `Hello ${student.student},

Your OTP for changing your BR Academy password is: ${otp}

This OTP expires in 5 minutes. Do not share it with anyone.

If you did not request this, you can ignore this email.

Regards,
BR Academy`,
      });
    } catch (emailError) {
      // Remove the OTP if delivery failed
      await OTP.deleteMany({ student: student._id });

      console.error("Password OTP email error:", emailError.message);

      return res.status(500).json({
        message: "Unable to send OTP email. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "OTP sent to your registered email address",
      expiresInSeconds: 300,
      resendAfterSeconds: 60,
    });
  } catch (error) {
    console.error("Send password OTP error:", error);

    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};



const verifyPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const student = await Student.findOne({
      email: cleanEmail,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student account not found",
      });
    }

    const otpRecord = await OTP.findOne({
      student: student._id,
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (otpRecord.expiresAt <= new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP",
      });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        message: "Maximum OTP attempts exceeded. Please request a new OTP",
      });
    }

    const submittedOTPHash = crypto
      .createHash("sha256")
      .update(String(otp).trim())
      .digest("hex");

    if (submittedOTPHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;

      if (otpRecord.attempts >= 5) {
        await OTP.deleteOne({ _id: otpRecord._id });

        return res.status(400).json({
          message: "Maximum OTP attempts exceeded. Please request a new OTP",
        });
      }

      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP",
        attemptsRemaining: 5 - otpRecord.attempts,
      });
    }

    // OTP is correct. Do not change the password here.
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    return res.status(200).json({
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("Verify password OTP error:", error);

    return res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
};

const changeStudentPassword = async (req, res) => {
  try {
    const {
      email,
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // 1. Validate required fields
    if (
      !email ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // 2. Find student
    const cleanEmail = email.trim().toLowerCase();

    const student = await Student.findOne({
      email: cleanEmail,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student account not found",
      });
    }

    // 3. Check current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      student.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // 4. Require a verified, unexpired OTP
    const otpRecord = await OTP.findOne({
      student: student._id,
    });

    if (!otpRecord || !otpRecord.verifiedAt) {
      return res.status(400).json({
        message: "Please verify your email OTP first",
      });
    }

    if (
      otpRecord.expiresAt <= new Date() ||
      Date.now() - new Date(otpRecord.verifiedAt).getTime() >
        5 * 60 * 1000
    ) {
      await OTP.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        message: "OTP verification has expired. Please request a new OTP",
      });
    }

    // 5. Hash and update the password
    student.password = await bcrypt.hash(newPassword, 10);

    // Keep the existing admin/welcome-email password field in sync
    if (student.plainPassword !== undefined) {
      student.plainPassword = newPassword;
    }

    await student.save();

    // 6. OTP must not be reusable
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change student password error:", error);

    return res.status(500).json({
      message: "Failed to change password",
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  changeStudentPassword,
  updateStudent,
  deleteStudent,
  sendPasswordChangeOTP,
  uploadStudentsFromExcel,
  verifyPasswordOTP,
  loginStudent,
};
