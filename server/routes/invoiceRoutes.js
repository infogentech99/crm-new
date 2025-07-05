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
  getTotalFinalInvoicesCount,
} from "../controllers/invoiceController.js";
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();


const SUMMARY_ROLES = [
  'superadmin',
  'admin',
  'salesperson',
  'employee',
  'accounts',
];


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
  authorize('superadmin', 'admin', 'salesperson', 'accounts'),
  deleteInvoice
);

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

router.get(
  '/summary/final-invoices-count',
  protect,
  authorize(...SUMMARY_ROLES),
  getTotalFinalInvoicesCount
);

export default router;
