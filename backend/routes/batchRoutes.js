
const express = require("express");

const {
  getBatches,
  getBatchById,
} = require("../controllers/batchController");

const router = express.Router();

router.get("/", getBatches);
router.get("/:id", getBatchById);

module.exports = router;
