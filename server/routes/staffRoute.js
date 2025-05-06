import express from 'express';
import multer from 'multer';
import StaffController from '../controller/staffController.js';
import { authMiddleware } from '../middleware/authstaff.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './documents';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (file.fieldname === 'profilePic') {
      cb(null, './images');
    } else if (file.fieldname === 'documents') {
      cb(null, './documents');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

// Multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  }
  next(err);
};

router.get('/', authMiddleware, StaffController.getStaff);
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'documents', maxCount: 10 },
  ]),
  handleMulterError,
  StaffController.addStaff
);
router.put(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'documents', maxCount: 10 },
  ]),
  handleMulterError,
  StaffController.updateStaff
);
router.post(
  '/:id/add-documents',
  authMiddleware,
  upload.fields([{ name: 'documents', maxCount: 10 }]),
  handleMulterError,
  StaffController.addDocuments
);
router.delete('/:id', authMiddleware, StaffController.deleteStaff);
router.post('/notify-update', authMiddleware, StaffController.notifyUpdate);

export default router;