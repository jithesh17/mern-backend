const express = require("express");

const {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  patchTrainer,
  deleteTrainer,
} = require("../controllers/trainerController");

const router = express.Router();

// CREATE
router.post("/", createTrainer);

// GET ALL
router.get("/", getTrainers);

// GET BY ID
router.get("/:id", getTrainerById);

// UPDATE - PUT
router.put("/:id", updateTrainer);

// UPDATE - PATCH
router.patch("/:id", patchTrainer);

// DELETE
router.delete("/:id", deleteTrainer);

module.exports = router;