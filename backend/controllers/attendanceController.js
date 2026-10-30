
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// Allowed attendance statuses
const allowedStatuses = ["Present", "Absent", "Late", "Leave"];

// Validate YYYY-MM-DD date format
const isValidDate = (date) => {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};

// ==========================================
// GET STUDENTS BY BATCH
// GET /api/attendance/batches/:batchId/students
// ==========================================
const getBatchStudents = async (req, res) => {
  try {
    const batch = req.params.batchId;

    if (!batch || !batch.trim()) {
      return res.status(400).json({
        message: "Batch is required",
      });
    }

    const students = await Student.find({
      batch: batch.trim(),
    })
      .select("-password")
      .sort({ student: 1 });

    return res.status(200).json({
      message: "Students fetched successfully",
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get batch students error:", error);

    return res.status(500).json({
      message: "Failed to load students",
      error: error.message,
    });
  }
};

// ==========================================
// GET ATTENDANCE BY BATCH AND DATE
// GET /api/attendance?batchId=MERN%20Stack&date=2026-10-22
// ==========================================
const getAttendance = async (req, res) => {
  try {
    const { batchId, date } = req.query;

    if (!batchId || !isValidDate(date)) {
      return res.status(400).json({
        message: "Valid batchId and date (YYYY-MM-DD) are required",
      });
    }

    const records = await Attendance.find({
      batch: batchId.trim(),
      date,
    })
      .populate("student", "student batch course")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Attendance fetched successfully",
      count: records.length,
      attendance: records,
    });
  } catch (error) {
    console.error("Get attendance error:", error);

    return res.status(500).json({
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
};

// ==========================================
// SAVE / MARK ATTENDANCE
// POST /api/attendance
// ==========================================
const saveAttendance = async (req, res) => {
  try {
    const { batch, date, records } = req.body;

    if (typeof batch !== "string" || !batch.trim()) {
      return res.status(400).json({
        message: "Batch is required",
      });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Date must be a valid YYYY-MM-DD date",
      });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        message: "Attendance records are required",
      });
    }

    const studentIds = records.map((item) => item.student);
    const selectedBatch = batch.trim();

    // Validate student IDs and statuses
    if (
      studentIds.some((id) => !mongoose.isValidObjectId(id)) ||
      new Set(studentIds.map(String)).size !== studentIds.length ||
      records.some(
        (item) => !allowedStatuses.includes(item.status)
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid student ID, duplicate student, or invalid attendance status",
      });
    }

    // Find students by ID first, then verify their batch
    const students = await Student.find({
      _id: { $in: studentIds },
    }).select("_id student batch");

    if (students.length !== studentIds.length) {
      return res.status(400).json({
        message: "One or more student IDs do not exist",
      });
    }

    const wrongBatchStudents = students.filter(
      (student) => student.batch.trim() !== selectedBatch
    );

    if (wrongBatchStudents.length > 0) {
      return res.status(400).json({
        message: "One or more students do not belong to this batch",
        requestedBatch: selectedBatch,
        actualStudents: wrongBatchStudents.map((student) => ({
          id: student._id,
          name: student.student,
          batch: student.batch,
        })),
      });
    }

    // Upsert: create a record or update the existing record
    const operations = records.map((item) => ({
      updateOne: {
        filter: {
          student: item.student,
          batch: selectedBatch,
          date,
        },
        update: {
          $set: {
            status: item.status,
            markedBy: req.trainer?.id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    const savedAttendance = await Attendance.find({
      batch: selectedBatch,
      date,
    })
      .populate("student", "student batch course")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Attendance saved successfully",
      count: savedAttendance.length,
      attendance: savedAttendance,
    });
  } catch (error) {
    console.error("Save attendance error:", error);

    return res.status(500).json({
      message: "Failed to save attendance",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE ATTENDANCE STATUS
// PUT /api/attendance/:id
// ==========================================
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid attendance ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance status",
      });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          markedBy: req.trainer?.id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("student", "student batch course");

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    return res.status(200).json({
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);

    return res.status(500).json({
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE ATTENDANCE
// DELETE /api/attendance/:id
// ==========================================
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid attendance ID",
      });
    }

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    return res.status(200).json({
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);

    return res.status(500).json({
      message: "Failed to delete attendance",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  getBatchStudents,
  getAttendance,
  saveAttendance,
  updateAttendance,
  deleteAttendance,
};
