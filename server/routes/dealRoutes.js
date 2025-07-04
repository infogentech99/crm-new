import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js'; 
import {
  createDeal,
  getDeals,
  getDeal, 
  updateDeal, 
  deleteDeal, 
  getTotalDealsValueSummary 
} from '../controllers/dealController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('superadmin','admin', 'salesperson'), getDeals) 
  .post(protect, authorize('superadmin','admin', 'salesperson'), createDeal); 


router.route('/:id')
  .get(protect, authorize('superadmin','admin', 'salesperson'), getDeal) 
  .put(protect, authorize('superadmin','admin', 'salesperson'), updateDeal) 
  .delete(protect, authorize('superadmin','admin', 'salesperson'), deleteDeal);

const DEAL_SUMMARY_ROLES = ['superadmin','admin','salesperson'];
router.get(
  '/summary/total-value',
  protect,
  authorize(...DEAL_SUMMARY_ROLES),
  getTotalDealsValueSummary
);

export default router;
