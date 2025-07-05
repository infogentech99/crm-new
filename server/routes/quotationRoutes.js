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
  authorize('superadmin','admin', 'accounts', 'salesperson'),
  getAllQuotations
);
router.get(
  '/:id',
  authorize('superadmin','admin','accounts', 'salesperson'),
  getQuotationById
);
router.put(
  '/:id',
  authorize('superadmin','admin', 'accounts', 'salesperson'),
  updateQuotation
);
router.delete(
  '/:id',
  authorize('superadmin','admin', 'accounts', 'salesperson'),
  deleteQuotation
);

export default router;




