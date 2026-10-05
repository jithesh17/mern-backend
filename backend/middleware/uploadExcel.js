const multer = require("multer");

// Store the uploaded Excel file in memory
const storage = multer.memoryStorage();

const uploadExcel = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls"];

    const fileName = file.originalname.toLowerCase();

    const isExcelFile = allowedExtensions.some((extension) =>
      fileName.endsWith(extension),
    );

    if (!isExcelFile) {
      return cb(new Error("Only Excel files (.xlsx or .xls) are allowed"));
    }

    cb(null, true);
  },
});

module.exports = uploadExcel;
