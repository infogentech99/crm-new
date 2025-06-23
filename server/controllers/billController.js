import Bill from '../models/Bill.js'; 

export const genrate = async (req, res) => {
  try {
    const { description, hsnCode, amount } = req.body;
    if (!description || !hsnCode || amount == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const bill = await Bill.create({
      description,
      hsnCode,
      amount,
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Bill created successfully', data: bill });
  } catch (err) {
    console.error('Error generating bill:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getAllBills = async (req, res) => {
  try {
    const page = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';

    const filter = {};
    
    // if (req.user.role !== 'superadmin') {
    //   filter.createdBy = req.user._id;
    // }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { hsnCode:     { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Bill.countDocuments(filter);
    const bills = await Bill.find(filter)
      .populate('createdBy', 'name role')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      bills,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBills: total
    });
  } catch (err) {
    console.error('getAllBills error:', err);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('createdBy', 'name role');
    if (!bill) {
    return res.status(404).json({ error: 'bill not found' });
    }

    // Ownership check
    if (req.user.role !== 'superadmin' &&
        !bill.createdBy._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ data: bill });
  } catch (err) {
    console.error('getBillById error:', err);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
};

// Update a bill
export const updateBill = async (req, res) => {
  try {
    const { description, hsnCode, amount } = req.body;
    if (!description || !hsnCode || amount == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Ownership check
    if (req.user.role !== 'superadmin' &&
        !bill.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    bill.description = description;
    bill.hsnCode     = hsnCode;
    bill.amount      = amount;
    await bill.save();

    res.json({ message: 'Bill updated successfully', data: bill });
  } catch (err) {
    console.error('Error updating bill:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Ownership check
    if (req.user.role !== 'superadmin' &&
        !bill.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await bill.deleteOne();
    res.json({ message: 'Billdeleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete Bill' });
  }
};
