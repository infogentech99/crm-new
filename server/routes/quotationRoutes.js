import express from 'express';
import { deleteQuotation, genrate, getAllQuotations, getQuotationById, updateQuotation } from '../controllers/quotationController.js';

const router = express.Router();
router.post('/genrate', genrate);
router.get('/', getAllQuotations);
router.get('/:id', getQuotationById);
router.put('/:id', updateQuotation);
router.delete('/:id', deleteQuotation);



export default router;