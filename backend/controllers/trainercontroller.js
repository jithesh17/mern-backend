
const Trainer = require("../models/trainer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendTrainerEmail = require("../utils/sendEmail");

// ==================================================
// CREATE TRAINER
// ==================================================
const createTrainer = async (req, res) => {
  try {
    const { name, email, password, course } = req.body;

    if (!name || !email || !password || !course) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingTrainer = await Trainer.findOne({
      email: normalizedEmail,
    });

    if (existingTrainer) {
      return res.status(409).json({
        message: "Trainer email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trainer = await Trainer.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      course: course.trim(),
    });

    let message = "Trainer created successfully";

    try {
      await sendTrainerEmail(
        normalizedEmail,
        trainer.name,
        password
      );
      message = "Trainer created and login details sent successfully";
    } catch (emailError) {
      console.error("Trainer email error:", emailError.message);
      message = "Trainer created, but email could not be sent";
    }

    return res.status(201).json({
      message,
      trainer: {
        _id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        course: trainer.course,
      },
    });
  } catch (error) {
    console.error("Create trainer error:", error);

    return res.status(500).json({
      message: "Failed to create trainer",
      error: error.message,
    });
  }
};

// ==================================================
// GET ALL TRAINERS
// ==================================================
const getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(trainers);
  } catch (error) {
    console.error("Get trainers error:", error);

    return res.status(500).json({
      message: "Failed to fetch trainers",
    });
  }
};

// ==================================================
// GET TRAINER BY ID
// ==================================================
const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .select("-password");

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    return res.status(200).json(trainer);
  } catch (error) {
    console.error("Get trainer by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch trainer",
    });
  }
};

// ==================================================
// UPDATE TRAINER - PUT
// ==================================================
const updateTrainer = async (req, res) => {
  try {
    const { name, email, password, course } = req.body;

    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    if (name !== undefined) {
      trainer.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      const duplicate = await Trainer.findOne({
        email: normalizedEmail,
        _id: { $ne: trainer._id },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Trainer email already exists",
        });
      }

      trainer.email = normalizedEmail;
    }

    if (course !== undefined) {
      trainer.course = course.trim();
    }

    if (password) {
      trainer.password = await bcrypt.hash(password, 10);
    }

    await trainer.save();

    return res.status(200).json({
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

    return res.status(500).json({
      message: "Failed to update trainer",
      error: error.message,
    });
  }
};

// ==================================================
// PATCH TRAINER
// ==================================================
const patchTrainer = async (req, res) => {
  try {
    const { name, email, password, course } = req.body;

    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    if (name !== undefined) {
      trainer.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      const duplicate = await Trainer.findOne({
        email: normalizedEmail,
        _id: { $ne: trainer._id },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Trainer email already exists",
        });
      }

      trainer.email = normalizedEmail;
    }

    if (course !== undefined) {
      trainer.course = course.trim();
    }

    if (password) {
      trainer.password = await bcrypt.hash(password, 10);
    }

    await trainer.save();

    return res.status(200).json({
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

    return res.status(500).json({
      message: "Failed to update trainer",
      error: error.message,
    });
  }
};

// ==================================================
// DELETE TRAINER
// ==================================================
const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    return res.status(200).json({
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    console.error("Delete trainer error:", error);

    return res.status(500).json({
      message: "Failed to delete trainer",
    });
  }
};

// ==================================================
// TRAINER LOGIN WITH JWT
// ==================================================
const loginTrainer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from .env");

      return res.status(500).json({
        message: "JWT configuration error",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const trainer = await Trainer.findOne({
      email: normalizedEmail,
    });

    if (!trainer) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      trainer.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        trainerId: trainer._id.toString(),
        role: "trainer",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    return res.status(200).json({
      message: "Trainer login successful",
      token,
      trainer: {
        _id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        course: trainer.course,
      },
    });
  } catch (error) {
    console.error("Trainer login error:", error);

    return res.status(500).json({
      message: "Trainer login failed",
    });
  }
};

// ==================================================
// GET LOGGED-IN TRAINER PROFILE
// Requires authMiddleware
// ==================================================
const getMyTrainer = async (req, res) => {
  try {
    const trainerId = req.trainer.id;

    const trainer = await Trainer.findById(trainerId)
      .select("-password");

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    return res.status(200).json(trainer);
  } catch (error) {
    console.error("Get my trainer error:", error);

    return res.status(500).json({
      message: "Failed to fetch trainer profile",
    });
  }
};

// ==================================================
// EXPORT ALL CONTROLLERS
// ==================================================
module.exports = {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  patchTrainer,
  deleteTrainer,
  loginTrainer,
  getMyTrainer,
};
