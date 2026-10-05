const Student = require("../models/Student");
const Course = require("../models/Course");
const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");

// =====================================================
// CREATE STUDENT
// =====================================================

const createStudent = async (req, res) => {
  try {
    const { student, password, course, batch, startDate, status } = req.body;

    // Check required fields
    if (!student || !password || !course || !batch || !startDate) {
      return res.status(400).json({
        message: "Student, password, course, batch and start date are required",
      });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check whether the selected course exists
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const newStudent = await Student.create({
      student,
      password: hashedPassword,
      course,
      batch,
      startDate,
      status: status || "Active",
    });

    res.status(201).json({
      message: "Student created successfully",

      // Do NOT send password/hash back to frontend
      student: {
        _id: newStudent._id,
        student: newStudent.student,
        course: newStudent.course,
        batch: newStudent.batch,
        startDate: newStudent.startDate,
        status: newStudent.status,
      },
    });
  } catch (error) {
    res.status(500).json({
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
    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE STUDENT - PUT
// =====================================================

const updateStudent = async (req, res) => {
  try {
    const { student, course, batch, startDate, status } = req.body;

    // Check required fields
    if (!student || !course || !batch || !startDate) {
      return res.status(400).json({
        message: "Student, course, batch and start date are required",
      });
    }

    // Check whether the course exists
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const updateData = {
      student,
      course,
      batch,
      startDate,
      status: status || "Active",
    };

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
      student: updatedStudent,
    });
  } catch (error) {
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
    // Check whether file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an Excel file",
      });
    }

    // Read Excel file from memory
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
      cellDates: false,
      raw: false,
    });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return res.status(400).json({
        message: "Excel file does not contain any sheet",
      });
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert Excel rows into JavaScript objects
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

    // Process each Excel row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Excel row number
      const excelRowNumber = i + 2;

      const studentName = String(row.student || "").trim();
      const password = String(row.password || "").trim();
      const courseName = String(row.course || "").trim();
      const batch = String(row.batch || "").trim();
      const startDate = row.startDate;
      const status = String(row.status || "Active").trim();

      // ---------------------------------------------
      // Validate required fields
      // ---------------------------------------------

      if (!studentName || !password || !courseName || !batch || !startDate) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName || "Unknown",
          reason: "Student, password, course, batch and startDate are required",
        });

        continue;
      }
      if (password.length < 6) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName,
          reason: "Password must be at least 6 characters",
        });

        continue;
      }

      // ---------------------------------------------
      // Validate status
      // ---------------------------------------------

      if (!["Active", "Completed"].includes(status)) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName,
          reason: "Status must be either Active or Completed",
        });

        continue;
      }

      // ---------------------------------------------
      // Find course by course name
      // ---------------------------------------------

      const existingCourse = await Course.findOne({
        course: {
          $regex: `^${courseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
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

      // ---------------------------------------------
      // Convert date
      // ---------------------------------------------
      // ---------------------------------------------
      // Convert Excel date safely
      // ---------------------------------------------

      // ---------------------------------------------
      // Convert Excel date safely
      // ---------------------------------------------

      let formattedDate;

      if (typeof startDate === "string") {
        const dateText = startDate.trim();

        // Handle YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
          const [year, month, day] = dateText.split("-").map(Number);

          formattedDate = new Date(Date.UTC(year, month - 1, day));
        }

        // Handle DD-MM-YYYY
        else if (/^\d{2}-\d{2}-\d{4}$/.test(dateText)) {
          const [day, month, year] = dateText.split("-").map(Number);

          formattedDate = new Date(Date.UTC(year, month - 1, day));
        }

        // Handle DD/MM/YYYY
        else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateText)) {
          const [day, month, year] = dateText.split("/").map(Number);

          formattedDate = new Date(Date.UTC(year, month - 1, day));
        }
      }

      // Excel serial number
      else if (typeof startDate === "number") {
        const excelDate = XLSX.SSF.parse_date_code(startDate);

        if (excelDate) {
          formattedDate = new Date(
            Date.UTC(excelDate.y, excelDate.m - 1, excelDate.d),
          );
        }
      }

      // Validate
      if (!formattedDate || isNaN(formattedDate.getTime())) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName,
          reason: "Invalid startDate",
        });

        continue;
      } else if (typeof startDate === "string") {
        // Handle YYYY-MM-DD
        const parts = startDate.trim().split("-");

        if (parts.length === 3) {
          const year = Number(parts[0]);
          const month = Number(parts[1]);
          const day = Number(parts[2]);

          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            formattedDate = new Date(Date.UTC(year, month - 1, day));
          }
        }
      }

      // Check date
      if (!formattedDate || isNaN(formattedDate.getTime())) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName,
          reason: "Invalid startDate",
        });

        continue;
      }

      // ---------------------------------------------
      // Create student
      // ---------------------------------------------

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = await Student.create({
          student: studentName,
          password: hashedPassword,
          course: existingCourse._id,
          batch: batch,
          startDate: formattedDate,
          status: status,
        });

        insertedStudents.push({
          row: excelRowNumber,
          student: newStudent.student,
        });
      } catch (studentError) {
        failedStudents.push({
          row: excelRowNumber,
          student: studentName,
          reason: studentError.message,
        });
      }
    }

    // ---------------------------------------------
    // Final response
    // ---------------------------------------------

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

    res.status(500).json({
      message: "Failed to process Excel file",
      error: error.message,
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
  updateStudent,
  deleteStudent,
  uploadStudentsFromExcel,
};
