const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL;
const uploadDir = isVercel ? '/tmp' : path.join(__dirname, '../../public/uploads');

try {
  if (!isVercel && !fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.warn('Gagal membuat folder uploads (biasanya karena Vercel Read-Only):', error.message);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Hanya file gambar (JPEG, JPG, PNG, WEBP) yang diperbolehkan'));
  }
});

module.exports = upload;
