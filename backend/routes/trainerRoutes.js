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


// CREATE TRAINER
// POST /api/trainers
router.post("/", createTrainer);


// GET ALL TRAINERS
// GET /api/trainers
router.get("/", getTrainers);


// GET TRAINER BY ID
// GET /api/trainers/:id
router.get("/:id", getTrainerById);


// UPDATE TRAINER
// PUT /api/trainers/:id
router.put("/:id", updateTrainer);


// PATCH TRAINER
// PATCH /api/trainers/:id
router.patch("/:id", patchTrainer);


// DELETE TRAINER
// DELETE /api/trainers/:id
router.delete("/:id", deleteTrainer);


module.exports = router;