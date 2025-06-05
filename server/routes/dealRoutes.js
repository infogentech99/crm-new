import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import authorize
import {
  createDeal,
  getDeals,
  getDeal, // Import new functions
  updateDeal, // Import new functions
  deleteDeal // Import new functions
} from '../controllers/dealController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize(['superadmin','admin', 'manager', 'employee']), getDeals) // Add authorize
  .post(protect, authorize(['superadmin','admin', 'manager', 'employee']), createDeal); // Add authorize

router.route('/:id')
  .get(protect, authorize(['superadmin','admin', 'manager', 'employee']), getDeal) // Add new route with authorize
  .put(protect, authorize(['superadmin','admin', 'manager']), updateDeal) // Add new route with authorize
  .delete(protect, authorize(['superadmin','admin', 'manager']), deleteDeal); // Add new route with authorize

export default router;
