import Lead from '../models/Lead.js';
import Invoice from '../models/Invoice.js';

export const createLead = async (req, res) => {
  try {
    const newLead = await Lead.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json(newLead);
  } catch (err) {
    console.error("createLead error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getLeadSourceSummary = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'superadmin') {
      query.createdBy = req.user._id;
    }

    const sourceSummary = await Lead.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          source: '$_id',
          count: 1,
        },
      },
    ]);

    const formattedSummary = sourceSummary.reduce((acc, item) => {
      acc[item.source] = item.count;
      return acc;
    }, {});

    res.status(200).json(formattedSummary);
  } catch (err) {
    console.error("getLeadSourceSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getLeadStatusSummary = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'superadmin') {
      query.createdBy = req.user._id;
    }

    const statusSummary = await Lead.aggregate([
      { $match: query },
      { $unwind: '$projects' },
      {
        $group: {
          _id: '$projects.status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    const formattedSummary = statusSummary.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {});

    res.status(200).json(formattedSummary);
  } catch (err) {
    console.error("getLeadStatusSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let query = {};

    if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.role !== 'accounts') {
      query.createdBy = req.user._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { projects: { $elemMatch: { title: { $regex: search, $options: 'i' } } } }, // ✅ Added
      ];
    }

    if (status) {
      query['projects.status'] = status; // Filter by status within the projects array
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
    console.error("getLeads error:", err);
    res.status(500).json({ message: err.message });
  }
};


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
    console.error("getLead error:", err);
    res.status(500).json({ message: err.message });
  }
};

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

    const { notes, projects, jobTitle, ...otherUpdates } = req.body; // Destructure jobTitle
    Object.assign(lead, otherUpdates);

    if (jobTitle !== undefined) { // Update jobTitle if provided
      lead.jobTitle = jobTitle;
    }

    if (notes && Array.isArray(notes)) {
      lead.notes = notes.map((note) => ({
        message: note.message,
        createdBy: note.createdBy || req.user._id,
        createdAt: note.createdAt || new Date(),
      }));
    }

    if (projects && Array.isArray(projects)) {
      lead.projects = projects;
    }
    await lead.save();
    res.status(200).json(lead);
  } catch (err) {
    console.error("updateLead error:", err);
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
    console.error("approveLead error:", err);
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
    console.error("denyLead error:", err);
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
    console.error("deleteLead error:", err);
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
    console.error("uploadQuotation error:", err);
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
    console.error("getLeadHistory error:", err);
    res.status(500).json({ message: err.message });
  }
};
