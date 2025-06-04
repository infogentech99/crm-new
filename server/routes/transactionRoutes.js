import express from 'express';
import { createTransaction, getTransactionsByInvoice, listTransactions, getTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import middleware

const router = express.Router();

// Route for listing all transactions with pagination/search
router.route('/')
  .get(protect, authorize(['superadmin','admin', 'manager', 'employee']), listTransactions)
  .post(protect, authorize(['superadmin','admin', 'manager', 'employee']), createTransaction);

// Route for getting transactions by invoice ID (if still needed, otherwise remove)
router.get('/:invoiceId', protect, authorize(['superadmin','admin', 'manager', 'employee']), getTransactionsByInvoice);

// Routes for single transaction CRUD
router.route('/:id')
  .get(protect, authorize(['superadmin','admin', 'manager', 'employee']), getTransaction)
  .put(protect, authorize(['superadmin','admin', 'manager']), updateTransaction)
  .delete(protect, authorize(['superadmin','admin', 'manager']), deleteTransaction);

export default router;
