
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  getBatchStudents,
  getAttendance,
  saveAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

router.use(authMiddleware);

router.get("/batches/:batchId/students", getBatchStudents);
router.get("/", getAttendance);
router.post("/", saveAttendance);
router.put("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

module.exports = router;
