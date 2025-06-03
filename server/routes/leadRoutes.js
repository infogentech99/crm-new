import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import {
  createLead,
  approveLead,
  denyLead,
  getLead,
  getLeads,
  updateLead,
  deleteLead,
  uploadQuotation,
  getLeadHistory,
} from '../controllers/leadController.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'quotations');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post(
  '/',
  protect,
  authorize('superadmin', 'admin', 'salesperson'),
  createLead
);

router.get(
  '/',
  protect,
  authorize('superadmin', 'admin', 'salesperson'),
  getLeads
);

router.get(
  '/:id',
  protect,
  authorize('superadmin', 'admin', 'salesperson'),
  getLead
);

router.put(
  '/:id',
  protect,
  authorize('superadmin', 'admin', 'salesperson'),
  updateLead
);

router.patch(
  '/:id/approve',
  protect,
  authorize('superadmin', 'admin'),
  approveLead
);

router.patch(
  '/:id/deny',
  protect,
  authorize('superadmin', 'admin'),
  denyLead
);

router.delete(
  '/:id',
  protect,
  authorize('superadmin'),
  deleteLead
);

router.post(
  '/:id/quotations',
  protect,
  authorize('superadmin', 'admin'),
  upload.single('file'),
  uploadQuotation
);
router.get(
  '/invoiceHistory/:id',
  protect,
  authorize('superadmin', 'admin', 'salesperson'),
  getLeadHistory
);


export default router;
