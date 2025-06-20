import express from 'express';
import {
  genrate,
  getAllQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation
} from '../controllers/quotationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('superadmin', 'admin', 'salesperson'));

router.post('/genrate', genrate);
router.get('/', getAllQuotations);
router.get('/:id', getQuotationById);
router.put('/:id', updateQuotation);
router.delete('/:id', deleteQuotation);

export default router;
