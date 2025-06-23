import express from 'express';
import { createTransaction, getTransactionsByInvoice, listTransactions, getTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import middleware

const router = express.Router();

router.route('/')
  .get(protect, authorize('superadmin','admin','salesperson'), listTransactions)
  .post(protect, authorize('superadmin','admin','salesperson'), createTransaction);

router.get('/:invoiceId/transactions',
  protect, authorize('superadmin','admin','salesperson'),
  getTransactionsByInvoice
);

router.route('/:id')
  .get(protect, authorize('superadmin','admin','salesperson'), getTransaction)
  .put(protect, authorize('superadmin','admin','salesperson'), updateTransaction)
  .delete(protect, authorize('superadmin','admin','salesperson'), deleteTransaction);

export default router;
