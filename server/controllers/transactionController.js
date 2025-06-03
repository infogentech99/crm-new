import Transaction from '../models/Transaction.js';
import Invoice     from '../models/NewInvoice.js';  

export const createTransaction = async (req, res, next) => {
  try {
    const { leadId, invoiceId, amount, method,transactionId } = req.body;

    if (!leadId || !invoiceId || amount == null || !method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invoice = await Invoice.findOne({ _id: invoiceId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const txn = await Transaction.create({
      user: leadId,
      invoice: invoiceId,
      amount,
      method,
      transactionId,
    });

    invoice.paidAmount = (invoice.paidAmount || 0) + amount;
    invoice.transactions = invoice.transactions || [];
    invoice.transactions.push(txn._id);
    await invoice.save();

    res.status(201).json(txn);
  } catch (err) {
    next(err);
  }
};

export const getTransactionsByInvoice = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    if (!invoiceId) {
      return res.status(400).json({ error: 'Missing invoice ID' });
    }
    const invoice = await Invoice.findById(invoiceId).populate('transactions');
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};


export const listTransactions = async (req, res, next) => {
    try {
      const txns = await Transaction.find().populate('invoice').populate('user').sort('-createdAt');
      res.json(txns);
    } catch (err) {
      next(err);
    }
  };
