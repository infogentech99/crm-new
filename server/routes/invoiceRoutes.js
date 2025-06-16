import express from 'express';
import { genrate, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice } from "../controllers/invoiceController.js";
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import middleware

const router = express.Router();

router.post('/genrate', protect, authorize(['superadmin','admin', 'manager', 'employee']), genrate); // Add protect and authorize
router.get('/', protect, authorize(['superadmin','admin', 'manager', 'employee']), getAllInvoices); // Add protect and authorize
router.get('/:id', protect, authorize(['superadmin','admin', 'manager', 'employee']), getInvoiceById); // Add protect and authorize
router.put('/:id', protect, authorize(['superadmin','admin', 'manager','employee']), updateInvoice); // Add protect and authorize (assuming manager/admin can update)
router.delete('/:id', protect, authorize(['superadmin','admin', 'manager','']), deleteInvoice); // Add protect and authorize (assuming manager/admin can delete)

export default router;
