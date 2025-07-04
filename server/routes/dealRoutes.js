import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import authorize
import {
  createDeal,
  getDeals,
  getDeal, // Import new functions
  updateDeal, // Import new functions
  deleteDeal, // Import new functions
  getTotalDealsValueSummary // Import new function
} from '../controllers/dealController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('superadmin','admin', 'salesperson', 'employee'), getDeals) // Add authorize
  .post(protect, authorize('superadmin','admin', 'salesperson', 'employee'), createDeal); // Add authorize

//router.get('/summary/total-value', protect, authorize(['superadmin','admin', 'manager', 'employee', 'accounts']), getTotalDealsValueSummary); // New route for total deals value summary

router.route('/:id')
  .get(protect, authorize('superadmin','admin', 'salesperson', 'employee'), getDeal) // Add new route with authorize
  .put(protect, authorize('superadmin','admin', 'salesperson'), updateDeal) // Add new route with authorize
  .delete(protect, authorize('superadmin','admin', 'salesperson'), deleteDeal); // Add new route with authorize

  
// Or if you have a roles-array variable:
const DEAL_SUMMARY_ROLES = ['superadmin','admin','salesperson','employee'];
router.get(
  '/summary/total-value',
  protect,
  authorize(...DEAL_SUMMARY_ROLES),
  getTotalDealsValueSummary
);

export default router;
