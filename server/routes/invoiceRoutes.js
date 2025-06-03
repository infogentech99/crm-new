import express from 'express';
import { genrate, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice } from "../controllers/invoiceController.js";
const router = express.Router();
router.post('/genrate', genrate);
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
