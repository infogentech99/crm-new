import Item    from '../models/Item.js';
import Invoice from '../models/Invoice.js';
import Lead    from '../models/Lead.js';

// Create
export const genrate = async (req, res) => {
  try {
    const { _id, totals, items, gstin, projectId } = req.body;
    if (!_id || !totals || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const invoice = await Invoice.create({
      user:      _id,
      totals,
      projectId,
      createdBy: req.user._id
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

    res.status(201).json({ message: 'Invoice generated', data: invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List & search
export const getAllInvoices = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim()  || '';

    // 1) build base query
    const query = {};

    // 2) text‐search on _id or Lead fields
    if (search) {
      const matchingLeads = await Lead.find({
        $or: [
          { name:  { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const leadIds = matchingLeads.map(l => l._id);

      query.$or = [
        { _id:  { $regex: search, $options: 'i' } },
        { user: { $in: leadIds } }
      ];
    }

    // 3) restrict non-superadmin to own invoices
    if (req.user.role !== 'superadmin' &&
        req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    // 4) fetch + paginate
    const total    = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('user')
      .populate('items')
      .populate('createdBy', 'name role')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      invoices,
      currentPage:  page,
      totalPages:   Math.ceil(total / limit),
      totalInvoices: total
    });
  } catch (err) {
    console.error('getAllInvoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Get one
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('user')
      .populate('items')
      .populate('createdBy', 'name role');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // enforce per-role access
    if (req.user.role !== 'superadmin' &&
        !invoice.createdBy._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ data: invoice });
  } catch (err) {
    console.error('getInvoiceById error:', err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

// Update
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { totals, items, gstin } = req.body;
    if (!totals || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const invoice = await Invoice.findById(id).populate('items').populate('createdBy');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // enforce per-role access
    if (req.user.role !== 'superadmin' &&
        !invoice.createdBy._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // replace items
    const oldIds = invoice.items.map(i => i._id);
    await Item.deleteMany({ _id: { $in: oldIds } });
    invoice.items = [];
    for (const it of items) {
      const newItem = await Item.create(it);
      invoice.items.push(newItem._id);
    }

    invoice.totals = totals;

    // update GSTIN on Lead
    const user = await Lead.findById(invoice.user);
    if (gstin && user) {
      user.gstin = gstin;
      await user.save();
    }

    await invoice.save();
    res.json({ message: 'Invoice updated successfully', data: invoice });
  } catch (err) {
    console.error('UpdateInvoice error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('createdBy');
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // enforce per-role access
    if (req.user.role !== 'superadmin' &&
        !invoice.createdBy._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    console.error('deleteInvoice error:', err);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};
