import express from 'express';
import {
  submitQuotation,
  approveQuotation,
  listQuotations,
  // Assuming you might add these later for full CRUD
  // getQuotation,
  // updateQuotation,
  // deleteQuotation,
} from '../controllers/quotationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes (if any, though typically quotations require auth)
// router.get('/', listQuotations); // If public listing is desired

// Protected routes
router.route('/')
  .get(protect, authorize(['admin', 'manager', 'employee']), listQuotations); // List all quotations with pagination/search

// Routes for specific quotation actions
router.route('/:id/submit')
  .post(protect, authorize(['admin', 'manager', 'employee']), submitQuotation); // Submit a new quotation (linked to a lead ID)

router.route('/:qid/approve')
  .put(protect, authorize(['admin', 'manager']), approveQuotation); // Approve a quotation

// Placeholder for full CRUD operations if needed later
// router.route('/:id')
//   .get(protect, authorize(['admin', 'manager', 'employee']), getQuotation)
//   .put(protect, authorize(['admin', 'manager']), updateQuotation)
//   .delete(protect, authorize(['admin', 'manager']), deleteQuotation);

export default router;
