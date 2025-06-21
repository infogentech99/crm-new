import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import authorize
import {
  createDeal,
  getDeals,
  getDeal, // Import new functions
  updateDeal, // Import new functions
  deleteDeal, // Import new functions
  getOpenDealsSummary // Import new function
} from '../controllers/dealController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('superadmin','admin', 'salesperson', 'employee'), getDeals) // Add authorize
  .post(protect, authorize('superadmin','admin', 'salesperson', 'employee'), createDeal); // Add authorize

router.get('/summary/open-deals', protect, authorize(['superadmin','admin', 'manager', 'employee']), getOpenDealsSummary); // New route for open deals summary

router.route('/:id')
  .get(protect, authorize('superadmin','admin', 'salesperson', 'employee'), getDeal) // Add new route with authorize
  .put(protect, authorize('superadmin','admin', 'salesperson'), updateDeal) // Add new route with authorize
  .delete(protect, authorize('superadmin','admin', 'salesperson'), deleteDeal); // Add new route with authorize

export default router;
