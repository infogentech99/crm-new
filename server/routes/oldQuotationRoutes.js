import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    genrate, getAllQuotations,
    getQuotationById,
    updateQuotation,
    deleteQuotation
} from '../controllers/newQuotationRoutes.js';
const router = express.Router();
router.post('/genrate', genrate);
router.get('/', getAllQuotations);
router.get('/:id', getQuotationById);
router.put('/:id', updateQuotation);
router.delete('/:id', deleteQuotation);



export default router;
