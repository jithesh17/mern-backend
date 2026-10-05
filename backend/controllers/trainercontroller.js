const bcrypt = require("bcryptjs");
const Trainer = require("../models/trainer");

// CREATE TRAINER
const createTrainer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      course,
    } = req.body;

    if (!name || !email || !password || !course) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingTrainer = await Trainer.findOne({
      email,
    });

    if (existingTrainer) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trainer = await Trainer.create({
      name,
      email,
      password: hashedPassword,
      course,
    });

    res.status(201).json({
      message: "Trainer created successfully",
      trainer: {
        _id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        course: trainer.course,
      },
    });
  } catch (error) {
    console.error("Create trainer error:", error);

    res.status(500).json({
      message: "Failed to create trainer",
      error: error.message,
    });
  }
};

// GET ALL TRAINERS
const getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(trainers);
  } catch (error) {
    console.error("Get trainers error:", error);

    res.status(500).json({
      message: "Failed to fetch trainers",
      error: error.message,
    });
  }
};

// GET TRAINER BY ID
const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .select("-password");

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    res.status(200).json(trainer);
  } catch (error) {
    console.error("Get trainer error:", error);

    res.status(500).json({
      message: "Failed to fetch trainer",
      error: error.message,
    });
  }
};

// UPDATE TRAINER
const updateTrainer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      course,
    } = req.body;

    const trainer = await Trainer.findById(
      req.params.id
    );

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    trainer.name = name;
    trainer.email = email;
    trainer.course = course;

    if (password) {
      trainer.password = await bcrypt.hash(
        password,
        10
      );
    }

    await trainer.save();

    res.status(200).json({
      message: "Trainer updated successfully",
      trainer: {
        _id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        course: trainer.course,
      },
    });
  } catch (error) {
    console.error("Update trainer error:", error);

    res.status(500).json({
      message: "Failed to update trainer",
      error: error.message,
    });
  }
};

// PATCH TRAINER
const patchTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(
      req.params.id
    );

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    if (req.body.name !== undefined) {
      trainer.name = req.body.name;
    }

    if (req.body.email !== undefined) {
      trainer.email = req.body.email;
    }

    if (req.body.course !== undefined) {
      trainer.course = req.body.course;
    }

    if (req.body.password) {
      trainer.password = await bcrypt.hash(
        req.body.password,
        10
      );
    }

    await trainer.save();

    res.status(200).json({
      message: "Trainer updated successfully",
      trainer: {
        _id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        course: trainer.course,
      },
    });
  } catch (error) {
    console.error("Patch trainer error:", error);

    res.status(500).json({
      message: "Failed to update trainer",
      error: error.message,
    });
  }
};

// DELETE TRAINER
const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(
      req.params.id
    );

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    res.status(200).json({
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    console.error("Delete trainer error:", error);

    res.status(500).json({
      message: "Failed to delete trainer",
      error: error.message,
    });
  }
};

module.exports = {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  patchTrainer,
  deleteTrainer,
};
