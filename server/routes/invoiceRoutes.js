import express from 'express';
import {
  genrate,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getTotalPaidInvoicesAmount,
  getMonthlyRevenueSummary,
  getPendingInvoiceAmountSummary,
  getTotalInvoicesAmount,
} from "../controllers/invoiceController.js";
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Define which roles can access summary endpoints
const SUMMARY_ROLES = [
  'superadmin',
  'admin',
  'salesperson',
  'employee',
  'accounts',
];

// Standard CRUD routes
router.post(
  '/genrate',
  protect,
  authorize(...SUMMARY_ROLES),
  genrate
);

router.get(
  '/',
  protect,
  authorize(...SUMMARY_ROLES),
  getAllInvoices
);

router.get(
  '/:id',
  protect,
  authorize(...SUMMARY_ROLES),
  getInvoiceById
);

router.put(
  '/:id',
  protect,
  authorize(...SUMMARY_ROLES),
  updateInvoice
);

router.delete(
  '/:id',
  protect,
  // maybe restrict deletes to non-employee roles
  authorize('superadmin', 'admin', 'salesperson', 'accounts'),
  deleteInvoice
);

// Summary endpoints, all using the same allowed roles
router.get(
  '/summary/monthly-revenue',
  protect,
  authorize(...SUMMARY_ROLES),
  getMonthlyRevenueSummary
);

router.get(
  '/summary/pending-amount',
  protect,
  authorize(...SUMMARY_ROLES),
  getPendingInvoiceAmountSummary
);

router.get(
  '/summary/total-amount',
  protect,
  authorize(...SUMMARY_ROLES),
  getTotalInvoicesAmount
);

router.get(
  '/summary/total-paid-amount',
  protect,
  authorize(...SUMMARY_ROLES),
  getTotalPaidInvoicesAmount
);

export default router;
