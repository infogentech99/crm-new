import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createDeal,
  getDeals
} from '../controllers/dealController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDeals)
  .post(createDeal);

export default router;