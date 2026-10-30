
const express = require("express");

const {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  patchTrainer,
  deleteTrainer,
  loginTrainer,
  getMyTrainer,
} = require("../controllers/trainercontroller");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Trainer login - no token required
router.post("/login", loginTrainer);

// Trainer profile - token required
router.get("/me", authMiddleware, getMyTrainer);

// Trainer management - no admin login required
router.post("/", createTrainer);
router.get("/", getTrainers);
router.get("/:id", getTrainerById);
router.put("/:id", updateTrainer);
router.patch("/:id", patchTrainer);
router.delete("/:id", deleteTrainer);

module.exports = router;
