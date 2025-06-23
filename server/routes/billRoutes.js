import express from 'express';
import { genrate, deleteBill, getBillById, updateBill, getAllBills } from '../controllers/billController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.post('/', protect, authorize('superadmin','admin', 'salesperson'), genrate);
router.get('/', protect, authorize('superadmin','admin', 'salesperson'), getAllBills); 
router.get('/:id', protect, authorize('superadmin','admin', 'salesperson'), getBillById); 
router.put('/:id', protect, authorize('superadmin','admin', 'salesperson'), updateBill);
router.delete('/:id', protect, authorize('superadmin','admin', 'salesperson'), deleteBill); 

export default router;
