const Allocation = require("../models/allocation");

// CREATE ALLOCATION
const createAllocation = async (req, res) => {
  try {
    const {
      trainer,
      course,
      studentBatch,
      startDate,
      endDate,
      status,
    } = req.body;

    if (
      !trainer ||
      !course ||
      !studentBatch ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const allocation = await Allocation.create({
      trainer,
      course,
      studentBatch,
      startDate,
      endDate,
      status: status || "Active",
    });

    const populatedAllocation =
      await Allocation.findById(allocation._id)
        .populate("trainer", "name")
        .populate("course", "course");

    res.status(201).json({
      message: "Allocation created successfully",
      allocation: populatedAllocation,
    });
  } catch (error) {
    console.error("Create allocation error:", error);

    res.status(500).json({
      message: "Failed to create allocation",
      error: error.message,
    });
  }
};


// GET ALL ALLOCATIONS
const getAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate("trainer", "name")
      .populate("course", "course")
      .sort({ createdAt: -1 });

    res.status(200).json(allocations);
  } catch (error) {
    console.error("Get allocations error:", error);

    res.status(500).json({
      message: "Failed to fetch allocations",
      error: error.message,
    });
  }
};


// GET SINGLE ALLOCATION
const getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate("trainer", "name")
      .populate("course", "course");

    if (!allocation) {
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    res.status(200).json(allocation);
  } catch (error) {
    console.error("Get allocation error:", error);

    res.status(500).json({
      message: "Failed to fetch allocation",
      error: error.message,
    });
  }
};


// UPDATE ALLOCATION
const updateAllocation = async (req, res) => {
  try {
    const allocation =
      await Allocation.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("trainer", "name")
        .populate("course", "course");

    if (!allocation) {
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    res.status(200).json({
      message: "Allocation updated successfully",
      allocation,
    });
  } catch (error) {
    console.error("Update allocation error:", error);

    res.status(500).json({
      message: "Failed to update allocation",
      error: error.message,
    });
  }
};


// DELETE ALLOCATION
const deleteAllocation = async (req, res) => {
  try {
    const allocation =
      await Allocation.findByIdAndDelete(req.params.id);

    if (!allocation) {
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    res.status(200).json({
      message: "Allocation deleted successfully",
    });
  } catch (error) {
    console.error("Delete allocation error:", error);

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