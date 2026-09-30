const express = require("express");
const multer = require("multer");

const {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  patchTrainer,
  deleteTrainer,
} = require("../controllers/trainerController");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },

  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// CREATE
router.post("/", upload.single("profile"), createTrainer);

// GET ALL
router.get("/", getTrainers);

// GET BY ID
router.get("/:id", getTrainerById);

// PUT
router.put("/:id", upload.single("profile"), updateTrainer);

// PATCH
router.patch("/:id", upload.single("profile"), patchTrainer);

// DELETE
router.delete("/:id", deleteTrainer);

module.exports = router;