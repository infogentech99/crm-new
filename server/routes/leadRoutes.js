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
  getLeadSourceSummary,
  getLeadStatusSummary
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
  authorize('superadmin', 'admin', 'salesperson','employee','accounts'),
  createLead
);

router.get(
  '/',
  protect,
  authorize('superadmin', 'admin', 'salesperson','employee','accounts'),
  getLeads
);

router.get(
  '/:id',
  protect,
  authorize('superadmin', 'admin', 'salesperson', 'employee','accounts'),
  getLead
);

router.get(
  '/invoiceHistory/:id',
  protect,
  authorize('superadmin', 'admin', 'salesperson','accounts'),
  getLeadHistory
);

router.get(
  '/summary/status',
  protect,
  authorize('superadmin', 'admin', 'salesperson', 'employee','accounts'),
  getLeadStatusSummary
);

router.get(
  '/summary/source',
  protect,
  authorize('superadmin', 'admin', 'salesperson', 'employee','accounts'),
  getLeadSourceSummary
);

router.put(
  '/:id',
  protect,
  authorize('superadmin', 'admin', 'salesperson','employee','accounts'),
  updateLead
);

router.patch(
  '/:id/approve',
  protect,
  authorize('superadmin', 'admin','accounts'),
  approveLead
);

router.patch(
  '/:id/deny',
  protect,
  authorize('superadmin', 'admin','accounts'),
  denyLead
);

router.delete(
  '/:id',
  protect,
  authorize('superadmin','accounts'),
  deleteLead
);

router.post(
  '/:id/quotations',
  protect,
  authorize('superadmin', 'admin','accounts'),
  upload.single('file'),
  uploadQuotation
);
router.get(
  '/invoiceHistory/:id',
  protect,
  authorize('superadmin', 'admin', 'salesperson','accounts'),
  getLeadHistory
);


export default router;
