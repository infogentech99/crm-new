import Item from '../models/Item.js';
import Lead from '../models/Lead.js';
import Quotation from '../models/Quotation.js';


export const genrate = async (req, res) => {
  try {
    const { _id, totals, items ,gstin} = req.body;

    if (!_id || typeof _id !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid lead ID (_id).' });
    }
    if (!totals || typeof totals !== 'object' || Array.isArray(totals)) {
      return res.status(400).json({ message: 'Missing or invalid totals.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required and must not be empty.' });
    }

    const user = await Lead.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (gstin) {
      user.gstin = gstin;
      await user.save();
    }

    const quotation = new Quotation({
      user: _id,
      totals,
      createdBy: req.user?._id, 
      items: []
    });

    for (const [idx, itemData] of items.entries()) {
      if (
        !itemData.description ||
        typeof itemData.price !== 'number' ||
        typeof itemData.quantity !== 'number'
      ) {
        return res.status(400).json({ message: `Invalid item at index ${idx}` });
      }
      const newItem = await Item.create(itemData);
      quotation.items.push(newItem._id);
    }

    await quotation.save();
    await quotation.populate('items');
    return res.status(201).json({ message: 'Quotation generated', data: quotation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllQuotations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || '';

    let query = {};
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    if (search) {      
      const matchedLeads = await Lead.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');

      const matchedLeadIds = matchedLeads.map(lead => lead._id);

      query = {
        $or: [
          { _id: { $regex: search, $options: 'i' } }, 
          { user: { $in: matchedLeadIds } }, 
        ],
      };
    }

    const totalQuotations = await Quotation.countDocuments(query);
    const quotations = await Quotation.find(query)
      .populate('user')  
      .populate('items')
      .populate('createdBy', 'name role')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      quotations,
      currentPage: page,
      totalPages:  Math.ceil(totalQuotations / limit),
      totalQuotations 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch quotations' });
  }
};

// // Get one by ID
// export const getQuotationById = async (req, res) => {
//   try {
//     const quotation = await Quotation.findById(req.params.id)
//       .populate('user')
//       .populate('items')
//       .populate('createdBy', 'name role');
//     if (!quotation) {
//       return res.status(404).json({ message: 'Quotation not found' });
//     }

//     // enforce per-role access
//     if (req.user.role !== 'superadmin' &&
//         !quotation.createdBy.equals(req.user._id)) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }

//     res.json({ data: quotation });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch quotation' });
//   }
// };


// Get one by ID
export const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('user')
      .populate('items')
      .populate('createdBy', 'name role');
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // enforce per-role access
    if (req.user.role !== 'superadmin' &&
        !quotation.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ data: quotation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch quotation' });
  }
};

// Update
export const updateQuotation = async (req, res) => {
  try {
    const { totals, items, gstin } = req.body;
    const quotation = await Quotation.findById(req.params.id).populate('items');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    // enforce per-role access
    if (req.user.role !== 'superadmin' &&
        !quotation.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // delete old items
    const oldIds = quotation.items.map(i => i._id);
    await Item.deleteMany({ _id: { $in: oldIds } });

    // create new items
    quotation.items = [];
    for (const itemData of items) {
      const newItem = await Item.create(itemData);
      quotation.items.push(newItem._id);
    }

    quotation.totals = totals;
    await quotation.save();

    // update lead GSTIN if given
    if (gstin) {
      const lead = await Lead.findById(quotation.user);
      if (lead) {
        lead.gstin = gstin;
        await lead.save();
      }
    }

    res.json({ message: 'Quotation updated', data: quotation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete
export const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Not found' });

    // enforce per-role access
    if (req.user.role !== 'superadmin' &&
        !quotation.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await quotation.deleteOne();
    res.json({ message: 'Quotation deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete quotation' });
  }
};
