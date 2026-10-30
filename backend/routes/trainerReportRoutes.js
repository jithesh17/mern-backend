const express = require("express");

const {
  getTrainerReport,
} = require("../controllers/trainerReportController");

const router = express.Router();

router.get("/", getTrainerReport);

module.exports = router;