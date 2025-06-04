import Item from '../models/Item.js';
import Invoice from '../models/NewInvoice.js';
import Lead from '../models/Lead.js';

export const genrate = async (req, res) => {
  try {
    const { _id, totals, items ,gstin} = req.body;

    if (!_id || !totals || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const invoice = await Invoice.create({
      user: _id,
      totals,
    });

    const user = await Lead.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (gstin) {
      user.gstin = gstin;
      await user.save();
    }

    for (const item of items) {
      const newItem = await Item.create(item);
      invoice.items.push(newItem._id);
    }

    await invoice.save();
    res.status(201).json({ message: 'Invoice generated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getAllInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, 'i': true } }, // Case-insensitive search
        { clientEmail: { $regex: search, 'i': true } }, // Case-insensitive search
      ];
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('user') // Assuming 'user' field exists and needs population
      .populate('items') // Assuming 'items' field exists and needs population
      .populate('transactions') // Assuming 'transactions' field exists and needs population
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      invoices,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalInvoices: total,
    });
  } catch (err) {
    console.error('getAllInvoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('user items');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ data: invoice });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { totals, items, gstin } = req.body;

    if (!id || !totals || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const invoice = await Invoice.findById(id).populate('items');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const oldItemIds = invoice.items.map(item => item._id);
    await Item.deleteMany({ _id: { $in: oldItemIds } });


    invoice.items = [];
    for (const item of items) {
      const newItem = await Item.create(item);
      invoice.items.push(newItem._id);
    }

    invoice.totals = totals;
    const user = await Lead.findById(invoice.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (gstin) {
      user.gstin = gstin;
      await user.save();
    }

    await invoice.save();

    res.status(200).json({
      message: 'Invoice updated successfully',
      data: invoice,
    });

  } catch (err) {
    console.error('Update Invoice Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteInvoice= async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoicedeleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quotation' });
  }
};
