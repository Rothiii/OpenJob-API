import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sendResponse } from "../utils/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(
      new Error("File harus berformat PDF. MIME type tidak valid"),
      false,
    );
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadWrapper = (req, res, next) => {
  upload.single("document")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendResponse(res, {
          status: "failed",
          statusCode: 400,
          message: "Ukuran file terlalu besar. Maksimal 5 MB",
        });
      }
      return sendResponse(res, {
        status: "failed",
        statusCode: 400,
        message: err.message,
      });
    } else if (err) {
      return sendResponse(res, {
        status: "failed",
        statusCode: 400,
        message: err.message,
      });
    }
    next();
  });
};

export default upload;
