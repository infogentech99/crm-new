import express from 'express';
import { genrate, deleteBill, getBillById, updateBill, getAllBills } from '../controllers/billController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.post('/', protect, authorize(['superadmin','admin', 'manager', 'employee']), genrate);
router.get('/', protect, authorize(['superadmin','admin', 'manager', 'employee']), getAllBills); 
router.get('/:id', protect, authorize(['superadmin','admin', 'manager', 'employee']), getBillById); 
router.put('/:id', protect, authorize(['superadmin','admin', 'manager']), updateBill);
router.delete('/:id', protect, authorize(['superadmin','admin', 'manager']), deleteBill); 

export default router;
