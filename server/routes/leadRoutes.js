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
  authorize('superadmin', 'admin', 'salesperson'),
  createLead
);

router.get(
  '/',
  protect,
  authorize('superadmin', 'admin', 'salesperson','accounts'),
  getLeads
);

router.get(
  '/:id',
  protect,
  authorize('superadmin', 'admin', 'salesperson',),
  getLead
);


router.get(
  '/summary/status',
  protect,
  authorize('superadmin', 'admin', 'salesperson',),
  getLeadStatusSummary
);

router.get(
  '/summary/source',
  protect,
  authorize('superadmin', 'admin', 'salesperson',),
  getLeadSourceSummary
);

router.put(
  '/:id',
  protect,
  authorize('superadmin', 'admin', 'salesperson'),
  updateLead
);


router.delete(
  '/:id',
  protect,
 authorize('superadmin', 'admin', 'salesperson'),
  deleteLead
);



export default router;
