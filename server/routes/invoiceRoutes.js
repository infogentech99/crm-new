import express from 'express';
import { genrate, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice, getMonthlyRevenueSummary, getPendingInvoiceAmountSummary } from "../controllers/invoiceController.js";
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import middleware

const router = express.Router();

router.post('/genrate', protect, authorize('superadmin','admin', 'salesperson', 'employee'), genrate); // Add protect and authorize
router.get('/', protect, authorize('superadmin','admin', 'salesperson', 'employee'), getAllInvoices); // Add protect and authorize
router.get('/:id', protect, authorize('superadmin','admin', 'salesperson', 'employee'), getInvoiceById); // Add protect and authorize
router.put('/:id', protect, authorize('superadmin','admin', 'salesperson','employee'), updateInvoice); // Add protect and authorize (assuming manager/admin can update)
router.delete('/:id', protect, authorize('superadmin','admin', 'salesperson',''), deleteInvoice); // Add protect and authorize (assuming manager/admin can delete)

router.get(
  '/summary/monthly-revenue',
  protect,
  authorize(['superadmin', 'admin', 'manager', 'employee']),
  getMonthlyRevenueSummary
);

router.get(
  '/summary/pending-amount',
  protect,
  authorize(['superadmin', 'admin', 'manager', 'employee']),
  getPendingInvoiceAmountSummary
);

export default router;
