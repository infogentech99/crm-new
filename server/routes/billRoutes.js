import express from 'express';
import { genrate, deleteBill, getBillById, updateBill, getAllBills } from '../controllers/billController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import middleware

const router = express.Router();

router.post('/', protect, authorize(['superadmin','admin', 'manager', 'employee']), genrate); // Add protect and authorize
router.get('/', protect, authorize(['superadmin','admin', 'manager', 'employee']), getAllBills); // Add protect and authorize
router.get('/:id', protect, authorize(['superadmin','admin', 'manager', 'employee']), getBillById); // Add protect and authorize
router.put('/:id', protect, authorize(['superadmin','admin', 'manager']), updateBill); // Add protect and authorize
router.delete('/:id', protect, authorize(['superadmin','admin', 'manager']), deleteBill); // Add protect and authorize

export default router;
