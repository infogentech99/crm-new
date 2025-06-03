import express from 'express';
import { genrate, deleteBill, getBillById, updateBill, getAllBills } from '../controllers/billController.js';
const router = express.Router();
router.post('/', genrate);
router.get('/', getAllBills);
router.get('/:id', getBillById);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);

export default router;