const Allocation = require("../models/allocation");

const getStudentReport = async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate("trainer", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: allocations.length,
      data: allocations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch student report",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentReport,
};
 