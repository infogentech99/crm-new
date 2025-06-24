import express from 'express';
import { genrate, deleteBill, getBillById, updateBill, getAllBills } from '../controllers/billController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.post('/', protect, authorize('superadmin','admin', 'salesperson', 'employee'), genrate);
router.get('/', protect, authorize('superadmin','admin', 'salesperson', 'employee'), getAllBills); 
router.get('/:id', protect, authorize('superadmin','admin', 'salesperson', 'employee'), getBillById); 
router.put('/:id', protect, authorize('superadmin','admin', 'salesperson', 'employee'), updateBill);
router.delete('/:id', protect, authorize('superadmin','admin', 'salesperson', 'employee'), deleteBill); 

export default router;
