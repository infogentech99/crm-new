import Lead from '../models/Lead.js';
import Invoice from '../models/NewInvoice.js';

export const createLead = async (req, res) => {
  try {
    const newLead = await Lead.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json(newLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET Leads (filtered based on roles, with search, status, and pagination)
export const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let query = {};

    if (req.user.role !== 'superadmin') {
      query.createdBy = req.user._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('createdBy', 'name email role')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      leads,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLeads: total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET Single Lead (only creator or superadmin can access)
export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email role');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (
      req.user.role !== 'superadmin' &&
      lead.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden: not your lead' });
    }

    res.status(200).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE Lead (similar permission logic as above)
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (
      req.user.role !== 'superadmin' &&
      lead.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden: not your lead' });
    }

    const { notes, ...otherUpdates } = req.body;
    Object.assign(lead, otherUpdates);
    if (notes && Array.isArray(notes)) {
      lead.notes = notes.map((note) => ({
        message: note.message,
        createdBy: note.createdBy || req.user._id,
        createdAt: note.createdAt || new Date(),
      }));
    }

    await lead.save();

    res.status(200).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const approveLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const denyLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: 'denied' },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(200).json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const uploadQuotation = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    lead.quotationUrl = `/uploads/quotations/${req.file.filename}`;
    await lead.save();

    res.status(200).json({ quotationUrl: lead.quotationUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLeadHistory = async (req, res) => {
  try {
    console.log('Fetching lead history for ID:', req.params.id);
    const lead = await Invoice.find({ user: req.params.id }).populate('items').populate('transactions'); 
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    // if (
    //   req.user.role !== 'superadmin' &&
    //   lead.createdBy._id.toString() !== req.user._id.toString()
    // ) {
    //   return res.status(403).json({ message: 'Forbidden: not your lead' });
    // }

    res.status(200).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
