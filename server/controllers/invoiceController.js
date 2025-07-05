import Item    from '../models/Item.js';
import Invoice from '../models/Invoice.js';
import Lead    from '../models/Lead.js';

// Create
export const genrate = async (req, res) => {
  try {
    const { _id, totals, items, gstin, projectId, status } = req.body; // Added status
    if (!_id || !totals || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const invoice = await Invoice.create({
      user:      _id,
      totals,
      projectId,
      status: status || 'Draft', // Set status, default to 'Draft'
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
    console.error("genrate error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMonthlyRevenueSummary = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11); // Go back 11 months to include current month

    let query = {
      createdAt: { $gte: twelveMonthsAgo },
      // Assuming 'Paid' status for revenue calculation
      // You might need to adjust this based on your Invoice schema's status field
      // For example, if status is 'Paid' or 'invoice_accepted'
      // status: 'Paid' 
    };

    // If you want to filter by user, add this:
    if (req.user.role !== 'superadmin' && req.user.role !== 'accounts' ) {
      query.createdBy = req.user._id;
    }

    const monthlyRevenue = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totals.total' }, // Assuming 'total' field in 'totals' object
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
      {
        $project: {
          _id: 0,
          name: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: 1,
                },
              },
            },
          },
          revenue: '$totalRevenue',
        },
      },
    ]);

    res.status(200).json(monthlyRevenue);
  } catch (err) {
    console.error("getMonthlyRevenueSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getTotalInvoicesAmount = async (req, res, next) => {
  try {
    const totalAmountResult = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalInvoicesAmount: { $sum: '$totals.total' }
        }
      }
    ]);

    res.status(200).json({
      totalPaidInvoicesAmount: totalPaidInvoicesAmountResult.length > 0 ? totalPaidInvoicesAmountResult[0].totalPaidInvoicesAmount : 0
    });
  } catch (err) {
    console.error('getTotalPaidInvoicesAmount error:', err);
    next(err);
  }
};

export const getTotalFinalInvoicesCount = async (req, res, next) => {
  try {
    const totalFinalInvoices = await Invoice.countDocuments({
      $expr: { $eq: ["$paidAmount", "$totals.total"] }
    });

    res.status(200).json({ totalFinalInvoices });
  } catch (err) {
    console.error('getTotalFinalInvoicesCount error:', err);
    next(err);
  }
};

export const getTotalPaidInvoicesAmount = async (req, res, next) => {
  try {
    const totalPaidAmountResult = await Invoice.aggregate([
      {
        $match: {
          status: 'Paid'
        }
      },
      {
        $group: {
          _id: null,
          totalPaidInvoicesAmount: { $sum: '$totals.total' }
        }
      }
    ]);

    res.status(200).json({
      totalPaidInvoicesAmount: totalPaidAmountResult.length > 0 ? totalPaidAmountResult[0].totalPaidInvoicesAmount : 0
    });
  } catch (err) {
    console.error('getTotalPaidInvoicesAmount error:', err);
    next(err);
  }
};

export const getPendingInvoiceAmountSummary = async (req, res, next) => {
  try {
    const pendingAmountResult = await Invoice.aggregate([
      {
        $match: {
          status: { $in: ['Pending', 'Overdue'] }
        }
      },
      {
        $group: {
          _id: null,
          totalPendingAmount: { $sum: { $subtract: ['$totals.total', { $ifNull: ['$paidAmount', 0] }] } }
        }
      }
    ]);

    res.status(200).json({
      totalPendingAmount: pendingAmountResult.length > 0 ? pendingAmountResult[0].totalPendingAmount : 0
    });
  } catch (err) {
    console.error('getPendingInvoiceAmountSummary error:', err);
    next(err);
  }
};

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


    if (req.user.role !== 'superadmin' &&
        req.user.role !== 'admin' && req.user.role !== 'accounts') {
      query.createdBy = req.user._id;
    }

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

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('user')
      .populate('items')
      .populate('createdBy', 'name role');
     

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }


    if (req.user.role !== 'superadmin' && req.user.role !== 'accounts' && req.user.role !== 'admin' && 
        !invoice.createdBy._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ data: invoice });
  } catch (err) {
    console.error("getInvoiceById error:", err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { totals, items, gstin, status } = req.body; // Added status
    if (!totals || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const invoice = await Invoice.findById(id).populate('items').populate('createdBy');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (req.user.role !== 'superadmin' && req.user.role !== 'accounts' && req.user.role !== 'admin' &&
        !invoice.createdBy._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const oldIds = invoice.items.map(i => i._id);
    await Item.deleteMany({ _id: { $in: oldIds } });
    invoice.items = [];
    for (const it of items) {
      const newItem = await Item.create(it);
      invoice.items.push(newItem._id);
    }

    invoice.totals = totals;
    if (status) {
      invoice.status = status; // Update status if provided
    }

    const user = await Lead.findById(invoice.user);
    if (gstin && user) {
      user.gstin = gstin;
      await user.save();
    }

    await invoice.save();
    res.json({ message: 'Invoice updated successfully', data: invoice });
  } catch (err) {
    console.error('updateInvoice error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('createdBy');
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // enforce per-role access
    if (req.user.role !== 'superadmin' && req.user.role !== 'accounts' && req.user.role !== 'admin' &&
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
