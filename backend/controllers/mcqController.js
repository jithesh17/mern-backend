const MCQ = require("../models/MCQ");
const Course = require("../models/Course");
const SubCourse = require("../models/SubCourse");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const MCQResult = require("../models/MCQResult");

// ==================================================
// CREATE MCQ
// ==================================================

const createMCQ = async (req, res) => {
  try {
    const { course, subCourse, question, options, correctAnswer } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!course || !subCourse || !question || !options || !correctAnswer) {
      return res.status(400).json({
        message: "All MCQ fields are required",
      });
    }

    // -----------------------------
    // Check Course
    // -----------------------------

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // -----------------------------
    // Check Sub Course
    // -----------------------------

    const existingSubCourse = await SubCourse.findById(subCourse);

    if (!existingSubCourse) {
      return res.status(404).json({
        message: "Sub course not found",
      });
    }

    // Make sure subcourse belongs to selected course
    if (existingSubCourse.course.toString() !== course.toString()) {
      return res.status(400).json({
        message: "Selected sub course does not belong to selected course",
      });
    }

    // -----------------------------
    // Validate Options
    // -----------------------------

    if (!options.A || !options.B || !options.C || !options.D) {
      return res.status(400).json({
        message: "All four options are required",
      });
    }

    // -----------------------------
    // Create MCQ
    // -----------------------------

    const mcq = await MCQ.create({
      course,
      subCourse,
      question,
      options,
      correctAnswer,
    });

    res.status(201).json({
      message: "MCQ created successfully",
      mcq,
    });
  } catch (error) {
    console.error("Create MCQ Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// GET ALL MCQs
// ==================================================

const getAllMCQs = async (req, res) => {
  try {
    const mcqs = await MCQ.find()
      .populate("course", "course")
      .populate("subCourse", "sub")
      .sort({ createdAt: -1 });

    res.status(200).json(mcqs);
  } catch (error) {
    console.error("Get MCQs Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// GET MCQs BY SUB COURSE
// ==================================================

const getMCQsBySubCourse = async (req, res) => {
  try {
    const { subCourseId } = req.params;

    const mcqs = await MCQ.find({
      subCourse: subCourseId,
    })
      .select("-correctAnswer")
      .populate("course", "course")
      .populate("subCourse", "sub")
      .sort({ createdAt: 1 });

    res.status(200).json(mcqs);
  } catch (error) {
    console.error("Get MCQs By SubCourse Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// GET SINGLE MCQ
// ==================================================

const getMCQById = async (req, res) => {
  try {
    const { id } = req.params;

    const mcq = await MCQ.findById(id)
      .populate("course", "course")
      .populate("subCourse", "sub");

    if (!mcq) {
      return res.status(404).json({
        message: "MCQ not found",
      });
    }

    res.status(200).json(mcq);
  } catch (error) {
    console.error("Get MCQ Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// UPDATE MCQ
// ==================================================

const updateMCQ = async (req, res) => {
  try {
    const { id } = req.params;

    const { course, subCourse, question, options, correctAnswer } = req.body;

    const existingMCQ = await MCQ.findById(id);

    if (!existingMCQ) {
      return res.status(404).json({
        message: "MCQ not found",
      });
    }

    // -----------------------------
    // Check Course
    // -----------------------------

    if (course) {
      const existingCourse = await Course.findById(course);

      if (!existingCourse) {
        return res.status(404).json({
          message: "Course not found",
        });
      }
    }

    // -----------------------------
    // Check Sub Course
    // -----------------------------

    if (subCourse) {
      const existingSubCourse = await SubCourse.findById(subCourse);

      if (!existingSubCourse) {
        return res.status(404).json({
          message: "Sub course not found",
        });
      }

      const selectedCourse = course || existingMCQ.course;

      if (existingSubCourse.course.toString() !== selectedCourse.toString()) {
        return res.status(400).json({
          message: "Selected sub course does not belong to selected course",
        });
      }
    }

    // -----------------------------
    // Update
    // -----------------------------

    existingMCQ.course = course || existingMCQ.course;

    existingMCQ.subCourse = subCourse || existingMCQ.subCourse;

    existingMCQ.question = question || existingMCQ.question;

    existingMCQ.options = options || existingMCQ.options;

    existingMCQ.correctAnswer = correctAnswer || existingMCQ.correctAnswer;

    await existingMCQ.save();

    res.status(200).json({
      message: "MCQ updated successfully",
      mcq: existingMCQ,
    });
  } catch (error) {
    console.error("Update MCQ Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// DELETE MCQ
// ==================================================

const deleteMCQ = async (req, res) => {
  try {
    const { id } = req.params;

    const mcq = await MCQ.findById(id);

    if (!mcq) {
      return res.status(404).json({
        message: "MCQ not found",
      });
    }

    await MCQ.findByIdAndDelete(id);

    res.status(200).json({
      message: "MCQ deleted successfully",
    });
  } catch (error) {
    console.error("Delete MCQ Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
// ==================================================
// UPLOAD MCQs FROM EXCEL
// ==================================================

const uploadMCQsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Excel file is required",
      });
    }

    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
    });

    if (!rows.length) {
      return res.status(400).json({
        message: "Excel file is empty",
      });
    }

    // Normalize Excel values and column headings
    const normalize = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase();

    const inserted = [];
    const failed = [];

    // Cache course and subcourse lookups
    const courseCache = new Map();
    const subCourseCache = new Map();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      try {
        // Accept readable names; also accept IDs for compatibility
        const courseValue = String(row.course ?? row.courseId ?? "").trim();

        const subCourseValue = String(
          row.subCourse ?? row.subCourseName ?? row.subCourseId ?? "",
        ).trim();

        const question = String(row.question ?? "").trim();

        const optionA = String(row.optionA ?? "").trim();
        const optionB = String(row.optionB ?? "").trim();
        const optionC = String(row.optionC ?? "").trim();
        const optionD = String(row.optionD ?? "").trim();

        const answer = normalize(row.correctAnswer).toUpperCase();

        if (
          !courseValue ||
          !subCourseValue ||
          !question ||
          !optionA ||
          !optionB ||
          !optionC ||
          !optionD ||
          !answer
        ) {
          throw new Error("All fields are required");
        }

        if (!["A", "B", "C", "D"].includes(answer)) {
          throw new Error("correctAnswer must be A, B, C or D");
        }

        // Find the course by ID or name
        const courseKey = normalize(courseValue);
        let existingCourse = courseCache.get(courseKey);

        if (!existingCourse) {
          if (mongoose.Types.ObjectId.isValid(courseValue)) {
            existingCourse = await Course.findById(courseValue);
          } else {
            const matchingCourses = await Course.find({
              course: {
                $regex: `^${courseValue.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&",
                )}$`,
                $options: "i",
              },
            });

            if (matchingCourses.length > 1) {
              throw new Error(
                `Multiple courses match "${courseValue}". Use the course ID.`,
              );
            }

            existingCourse = matchingCourses[0] || null;
          }

          if (!existingCourse) {
            throw new Error(`Course "${courseValue}" not found`);
          }

          courseCache.set(courseKey, existingCourse);
        }

        // Find the subcourse by ID or name
        const subCourseKey = `${existingCourse._id}:${normalize(subCourseValue)}`;

        let existingSubCourse = subCourseCache.get(subCourseKey);

        if (!existingSubCourse) {
          if (mongoose.Types.ObjectId.isValid(subCourseValue)) {
            existingSubCourse = await SubCourse.findOne({
              _id: subCourseValue,
              course: existingCourse._id,
            });
          } else {
            const matchingSubCourses = await SubCourse.find({
              course: existingCourse._id,
              sub: {
                $regex: `^${subCourseValue.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&",
                )}$`,
                $options: "i",
              },
            });

            if (matchingSubCourses.length > 1) {
              throw new Error(
                `Multiple subcourses match "${subCourseValue}". Use the subcourse ID.`,
              );
            }

            existingSubCourse = matchingSubCourses[0] || null;
          }

          if (!existingSubCourse) {
            throw new Error(
              `Subcourse "${subCourseValue}" was not found under course "${existingCourse.course}"`,
            );
          }

          subCourseCache.set(subCourseKey, existingSubCourse);
        }

        const mcq = await MCQ.create({
          course: existingCourse._id,
          subCourse: existingSubCourse._id,
          question,
          options: {
            A: optionA,
            B: optionB,
            C: optionC,
            D: optionD,
          },
          correctAnswer: answer,
        });

        inserted.push({
          row: rowNumber,
          mcqId: mcq._id,
          course: existingCourse.course,
          subCourse: existingSubCourse.sub,
          question: mcq.question,
        });
      } catch (error) {
        failed.push({
          row: rowNumber,
          question: row.question || "",
          error: error.message,
        });
      }
    }

    return res.status(201).json({
      message: "MCQ Excel upload completed",
      totalRows: rows.length,
      insertedCount: inserted.length,
      failedCount: failed.length,
      inserted,
      failed,
    });
  } catch (error) {
    console.error("Upload MCQ Excel Error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


const submitMCQ = async (req, res) => {
  try {
    const { subCourseId, answers } = req.body;

    // Check student authentication
    if (!req.student || req.student.role !== "student") {
      return res.status(403).json({
        message: "Only logged-in students can submit quizzes",
      });
    }

    // Validate subcourse ID
    if (!mongoose.Types.ObjectId.isValid(subCourseId)) {
      return res.status(400).json({
        message: "Invalid subcourse ID",
      });
    }

    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return res.status(400).json({
        message: "Answers are required",
      });
    }

    // Get all questions for this subcourse
    const mcqs = await MCQ.find({ subCourse: subCourseId });

    if (mcqs.length === 0) {
      return res.status(404).json({
        message: "No questions found for this subcourse",
      });
    }

    // Check that every question has an answer
    const questionIds = new Set(mcqs.map((q) => q._id.toString()));

    if (
      mcqs.some((q) => !answers[q._id.toString()]) ||
      Object.keys(answers).some((id) => !questionIds.has(id))
    ) {
      return res.status(400).json({
        message: "Please submit a valid answer for every question",
      });
    }

    // Calculate the score on the backend
    let score = 0;

    mcqs.forEach((question) => {
      const studentAnswer = answers[question._id.toString()];

      if (
        typeof studentAnswer === "string" &&
        studentAnswer.toUpperCase() === question.correctAnswer
      ) {
        score++;
      }
    });

    const totalQuestions = mcqs.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;

    // Save the result in MongoDB
    const result = await MCQResult.create({
      student: req.student.id,
      course: mcqs[0].course,
      subCourse: subCourseId,
      totalQuestions,
      correctAnswers: score,
      percentage,
      passed,
    });

    // Send the result to the frontend
    return res.status(200).json({
      message: "Quiz submitted and result saved successfully",
      resultId: result._id,
      totalQuestions,
      correctAnswers: score,
      percentage,
      passed,
    });
  } catch (error) {
    console.error("Submit MCQ Error:", error);

    return res.status(500).json({
      message: "Unable to submit quiz",
    });
  }
};

const getMyMCQResults = async (req, res) => {
  try {
    if (!req.student || req.student.role !== "student") {
      return res.status(403).json({
        message: "Only students can view their quiz results",
      });
    }

    const results = await MCQResult.find({
      student: req.student.id,
    }).select("subCourse percentage passed");

    return res.status(200).json(results);
  } catch (error) {
    console.error("Get MCQ results error:", error);

    return res.status(500).json({
      message: "Unable to fetch quiz results",
    });
  }
};



module.exports = {
  createMCQ,
  getAllMCQs,
  getMCQsBySubCourse,
  getMCQById,
  updateMCQ,
  deleteMCQ,
  uploadMCQsFromExcel,
  submitMCQ,
  getMyMCQResults
};
