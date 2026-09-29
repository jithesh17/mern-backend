const Trainer = require("../models/trainer");

// CREATE TRAINER
const createTrainer = async (req, res) => {
  try {
    const { name, department } = req.body;

    if (!name || !department) {
      return res.status(400).json({
        message: "Name and department are required",
      });
    }     

    const trainer = await Trainer.create({
      name,
      department,
    });

    res.status(201).json({
      message: "Trainer created successfully",
      trainer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create trainer",
      error: error.message,
    });
  }
};

// GET ALL TRAINERS
const getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });

    res.status(200).json(trainers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch trainers",
      error: error.message,
    });
  }
};

// GET TRAINER BY ID
const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch trainer",
      error: error.message,
    });
  }
};

// UPDATE TRAINER - PUT
const updateTrainer = async (req, res) => {
  try {
    const { name, department } = req.body;

    const updatedTrainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        department,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTrainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    res.status(200).json({
      message: "Trainer updated successfully",
      trainer: updatedTrainer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update trainer",
      error: error.message,
    });
  }
};

// PATCH TRAINER
const patchTrainer = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name !== undefined) {
      updateData.name = req.body.name;
    }

    if (req.body.department !== undefined) {
      updateData.department = req.body.department;
    }

    const updatedTrainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTrainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }
      
    res.status(200).json({
      message: "Trainer patched successfully",
      trainer: updatedTrainer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to patch trainer",
      error: error.message,
    });
  }
};

// DELETE TRAINER
const deleteTrainer = async (req, res) => {
  try {
    const deletedTrainer = await Trainer.findByIdAndDelete(
      req.params.id
    );

    if (!deletedTrainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    res.status(200).json({
      message: "Trainer deleted successfully",
    });
  } catch (error) {
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