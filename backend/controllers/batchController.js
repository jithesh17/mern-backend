
const Allocation = require("../models/allocation");

// GET ALL BATCHES
const getBatches = async (req, res) => {
  try {
    const batches = await Allocation.find()
      .populate("trainer", "name")
      .populate("course", "course")
      .sort({ createdAt: -1 });

    const formattedBatches = batches.map((item) => ({
      _id: item._id,
      studentBatch: item.studentBatch,
      trainer: item.trainer,
      course: item.course,
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status,
      createdAt: item.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedBatches.length,
      batches: formattedBatches,
    });
  } catch (error) {
    console.error("Get batches error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch batches",
      error: error.message,
    });
  }
};

// GET SINGLE BATCH
const getBatchById = async (req, res) => {
  try {
    const batch = await Allocation.findById(req.params.id)
      .populate("trainer", "name")
      .populate("course", "course");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch batch",
      error: error.message,
    });
  }
};

module.exports = {
  getBatches,
  getBatchById,
};
