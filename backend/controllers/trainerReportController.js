const Trainer = require("../models/trainer");
const Allocation = require("../models/allocation");

const getTrainerReport = async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });

    const report = await Promise.all(
      trainers.map(async (trainer) => {
        const allocations = await Allocation.find({
          trainer: trainer._id,
        })
          .populate("course", "course")
          .sort({ createdAt: -1 });

        return {
          _id: trainer._id,
          name: trainer.name,
          course: trainer.course,
          email: trainer.email || "-",

          totalAllocations: allocations.length,

          allocations: allocations.map((allocation) => ({
            allocationId: allocation._id,
            course: allocation.course?.course || "-",
            studentBatch: allocation.studentBatch || "-",
            startDate: allocation.startDate,
            endDate: allocation.endDate,
            status: allocation.status,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (error) {
    console.error("Trainer report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trainer report",
      error: error.message,
    });
  }
};

module.exports = {
  getTrainerReport,
};