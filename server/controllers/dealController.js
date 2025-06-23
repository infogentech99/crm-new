import Deal from '../models/Deal.js';

export const createDeal = async (req, res, next) => {
  try {
    const deal = await Deal.create(req.body);
    res.status(201).json(deal);
  } catch (err) {
    next(err);
  }
};

export const getTotalDealsValueSummary = async (req, res, next) => {
  try {
    const totalDeals = await Deal.aggregate([
      { $group: { _id: null, totalValue: { $sum: '$value' }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalDealsValue: totalDeals.length > 0 ? totalDeals[0].totalValue : 0,
      totalDealsCount: totalDeals.length > 0 ? totalDeals[0].count : 0,
    });
  } catch (err) {
    console.error('getTotalDealsValueSummary error:', err);
    next(err);
  }
};

export const getDeals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = {};

    if (search) {
      query.$or = [
        { dealName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Deal.countDocuments(query);
    const deals = await Deal.find(query)
      .populate({ path: 'contactPerson', select: 'name company' }) // Assuming contactPerson can be Lead or Contact
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      deals,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDeals: total,
    });
  } catch (err) {
    console.error('getDeals error:', err);
    next(err);
  }
};

export const getDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id).populate({ path: 'contactPerson', select: 'name company' });
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.status(200).json({ success: true, data: deal });
  } catch (err) {
    next(err);
  }
};

export const updateDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.status(200).json({ success: true, data: deal });
  } catch (err) {
    next(err);
  }
};

export const deleteDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.status(200).json({ success: true, message: 'Deal deleted' });
  } catch (err) {
    next(err);
  }
};
