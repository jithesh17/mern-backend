const Allocation = require("../models/allocation");

// CREATE
const createAllocation = async (req, res) => {
  try {
    const { trainer, studentBatch, startDate, endDate, status } = req.body;

    const allocation = await Allocation.create({
      trainer,
      studentBatch,
      startDate,
      endDate,
      status,
    });

    res.status(201).json({
      message: "Allocation created successfully",
      allocation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create allocation",
      error: error.message,
    });
  }
};

// GET ALL
const getAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate("trainer", "name department")
      .sort({ createdAt: -1 });

    res.json(allocations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch allocations",
      error: error.message,
    });
  }
};

// GET ONE
const getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate("trainer", "name department");

    if (!allocation) {
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    res.json(allocation);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch allocation",
      error: error.message,
    });
  }
};

// UPDATE
const updateAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("trainer", "name department");

    if (!allocation) {
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    res.json({
      message: "Allocation updated successfully",
      allocation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update allocation",
      error: error.message,
    });
  }
};

// DELETE
const deleteAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByIdAndDelete(req.params.id);

    if (!allocation) {
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    res.json({
      message: "Allocation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete allocation",
      error: error.message,
    });
  }
};

module.exports = {
  createAllocation,
  getAllocations,
  getAllocationById,
  updateAllocation,
  deleteAllocation,
};
