import multer from 'multer';

// Shared in-memory storage for buffering uploads before sending to R2
const memoryStorage = multer.memoryStorage();

// Allow only image/* files
const imageFileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

// Avatar uploads: only images, single file, max 2MB
export const avatarUploadSingle = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('avatar');

// Chat media uploads: any file types, single or multiple, max 15MB per file
export const chatMediaUploadArray = multer({
  storage: memoryStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
}).array('files');

// Optional: single media upload variant (if needed by callers)
export const chatMediaUploadSingle = multer({
  storage: memoryStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
}).single('file');