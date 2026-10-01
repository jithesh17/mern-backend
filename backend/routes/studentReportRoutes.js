const express = require("express");

const {
  getStudentReport,
} = require("../controllers/studentReportController");

const router = express.Router();

router.get("/", getStudentReport);

module.exports = router;
