// import express from 'express';
// import { createTransaction, getTransactionsByInvoice, listTransactions, getTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController.js';
// import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import middleware

// const router = express.Router();

// // Route for listing all transactions with pagination/search
// router.route('/')
//   .get(protect, authorize(['superadmin','admin', 'salesperson', 'employee']), listTransactions)
//   .post(protect, authorize(['superadmin','admin', 'salesperson', 'employee']), createTransaction);

// // Route for getting transactions by invoice ID (if still needed, otherwise remove)
// router.get('/:invoiceId', protect, authorize(['superadmin','admin', 'salesperson', 'employee']), getTransactionsByInvoice);

// // Routes for single transaction CRUD
// router.route('/:id')
//   .get(protect, authorize(['superadmin','admin', 'salesperson', 'employee']), getTransaction)
//   .put(protect, authorize(['superadmin','admin', 'salesperson']), updateTransaction)
//   .delete(protect, authorize(['superadmin','admin', 'salesperson']), deleteTransaction);

// export default router;



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
