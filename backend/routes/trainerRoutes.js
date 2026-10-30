
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

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

const router = express.Router();

// Login - token not required
router.post("/login", loginTrainer);

// All routes below require a valid JWT token
router.use(authMiddleware);

// Logged-in trainer details
router.get("/me", getMyTrainer);

// Trainer CRUD
router.post("/", createTrainer);
router.get("/", getTrainers);
router.get("/:id", getTrainerById);
router.put("/:id", updateTrainer);
router.patch("/:id", patchTrainer);
router.delete("/:id", deleteTrainer);

module.exports = router;
