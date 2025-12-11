/**
 * Multer configuration for file uploads
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD } = require('./constants');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'service-requests');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Configure storage for file uploads
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * File filter to allow only image files
 */
const fileFilter = (req, file, cb) => {
  const extname = /jpeg|jpg|png|gif/.test(path.extname(file.originalname).toLowerCase());
  const mimetype = UPLOAD.ALLOWED_TYPES.includes(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
  }
};

/**
 * Configure multer instance
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: UPLOAD.MAX_FILE_SIZE },
  fileFilter: fileFilter
});

module.exports = {
  upload,
  uploadsDir
};

