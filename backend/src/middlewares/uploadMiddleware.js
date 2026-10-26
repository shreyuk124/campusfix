import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Storage Engine: Where and how to save the file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

// 3. Security Filter: Allow all standard mobile image formats
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
  const isImageMime = file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';

  if (isImageMime || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    console.warn(`[Multer] Rejected file "${file.originalname}" with mimetype "${file.mimetype}"`);
    const error = new Error(
      `File format "${file.mimetype}" is not supported. Please upload JPG, PNG, or WebP.`
    );
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// 4. Multer Instance with Strict Limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // Generous 25MB limit for high-res mobile photos
    files: 3,                  // Maximum 3 photos
  },
});

// 5. Middleware wrapper with standardized API Contract error handling
export const uploadIssuePhotos = (req, res, next) => {
  const uploadArray = upload.array('photos', 3);

  uploadArray(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'One or more files exceed the maximum allowed size of 25MB.',
          },
        });
      }

      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'TOO_MANY_FILES',
            message: 'You can attach a maximum of 3 photos.',
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: err.message,
        },
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: err.code || 'BAD_REQUEST',
          message: err.message,
        },
      });
    }

    next();
  });
};
