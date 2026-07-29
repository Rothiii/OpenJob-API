import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { InvariantError } from '../errors/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOAD_DIR = path.join(__dirname, '../../uploads');
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname) || '.pdf'}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(
      new InvariantError('File is required and must be a PDF document'),
      false
    );
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * Wraps multer so its own errors come back through the app's error handler in
 * the standard JSON shape instead of multer's default HTML response.
 */
export const uploadDocument = (req, res, next) => {
  upload.single('document')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'File size is too large. Maximum size is 5 MB'
          : error.message;

      return next(new InvariantError(message));
    }

    if (error) return next(error);

    if (!req.file) return next(new InvariantError('File is required'));

    return next();
  });
};

export default upload;
