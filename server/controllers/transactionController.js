
import Transaction from '../models/Transaction.js';
import Invoice     from '../models/Invoice.js';
import Lead        from '../models/Lead.js';

export const createTransaction = async (req, res, next) => {
  try {
    const { leadId, invoiceId, amount, method, transactionId, projectId } = req.body;
    if (!leadId || !invoiceId || amount == null || !method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const txn = await Transaction.create({
      user: leadId,
      invoice: invoiceId,
      amount,
      method,
      transactionId,
      projectId,  
       createdBy:     req.user._id
    });
    invoice.paidAmount = (invoice.paidAmount || 0) + amount;
    invoice.transactions = invoice.transactions || [];
    invoice.transactions.push(txn._id);
    await invoice.save();

    await Lead.findByIdAndUpdate(leadId, {
      $push: {
        transactions: {
          transaction: txn.transactionId,
          invoiceId,
          date: new Date(),
          amount,
          method,
          projectId
        }
      }
    });

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
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const txnQuery = { invoice: invoiceId };
    if (req.user.role !== 'superadmin') {
      txnQuery.createdBy = req.user._id;
    }

    const txns = await Transaction.find(txnQuery)
      .populate({ path: 'invoice', select: '_id invoiceNumber' })
      .populate({ path: 'user',    select: 'name email' })
      .sort('-createdAt');
    res.json({ invoiceId, transactions: txns });
  } catch (err) {
    next(err);
  }
};


export const listTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim()  || '';
    const invoiceId = req.query.invoiceId;

    const query = {};
    if (invoiceId) {
      query.invoice = invoiceId;
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }
     if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const total = await Transaction.countDocuments(query);
    const txns  = await Transaction.find(query)
      .populate({ path: 'invoice', select: '_id invoiceNumber' })
      .populate({ path: 'user', select: 'name email' })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      transactions: txns,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTransactions: total,
    });
  } catch (err) {
    console.error('listTransactions error:', err);
    next(err);
  }
};


export const getTransaction = async (req, res, next) => {
  try {
    const txn = await Transaction.findById(req.params.id)
      .populate({ path: 'invoice', select: '_id invoiceNumber' })
      .populate({ path: 'user', select: 'name email' });
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (req.user.role !== 'superadmin' && !txn.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.status(200).json({ success: true, data: txn });
  } catch (err) {
    next(err);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (req.user.role !== 'superadmin' && !txn.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    Object.assign(txn, req.body);
    await txn.save();
    res.status(200).json({ success: true, data: txn });
  } catch (err) {
    next(err);
  }
};


export const deleteTransaction = async (req, res, next) => {
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (req.user.role !== 'superadmin' && !txn.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await txn.deleteOne();
    res.status(200).json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};
