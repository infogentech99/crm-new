import express from 'express';
import { createTransaction, getTransactionsByInvoice, listTransactions } from '../controllers/transactionController.js';

const router = express.Router();

router.post('/', createTransaction);
router.get('/:invoiceId', getTransactionsByInvoice);
router.get('/', listTransactions);

export default router;