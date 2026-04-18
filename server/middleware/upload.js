const multer = require('multer');
const path = require('path');

// Memory storage for processing with Sharp before uploading to Supabase Storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.tiff', '.heic', '.heif', '.avif']);
  const ext = path.extname(file.originalname || '').toLowerCase();
  const hasAllowedExt = allowedExt.has(ext);
  const isImageMime = typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');

  // Some mobile browsers provide unusual or generic MIME types; allow trusted image extensions too.
  if (isImageMime || hasAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, webp, gif, bmp, tiff, heic, heif, avif).'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;
