
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      decoded.role !== "trainer" ||
      !decoded.trainerId
    ) {
      return res.status(403).json({
        message: "Trainer access denied",
      });
    }

    req.trainer = {
      id: decoded.trainerId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT error:", error.name, error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
