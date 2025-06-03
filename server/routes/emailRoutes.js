import express from 'express';
import downloadEmail from '../controllers/send-invoiceController.js';
const router = express.Router();
router.post('/send-invoice', downloadEmail);
export default router;