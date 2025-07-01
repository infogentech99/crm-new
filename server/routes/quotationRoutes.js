import express from 'express';
import {
  genrate,
  getAllQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation
} from '../controllers/quotationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post(
  '/genrate',
  authorize('superadmin', 'admin', 'salesperson','accounts'),
  genrate
);
router.get(
  '/',
  authorize('superadmin','accounts'),
  getAllQuotations
);
router.get(
  '/:id',
  authorize('superadmin','accounts'),
  getQuotationById
);
router.put(
  '/:id',
  authorize('superadmin','accounts'),
  updateQuotation
);
router.delete(
  '/:id',
  authorize('superadmin','accounts'),
  deleteQuotation
);

export default router;




