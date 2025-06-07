import Item from '../models/Item.js';
import Lead from '../models/Lead.js';
import Quotation from '../models/Quotation.js';

export const genrate = async (req, res) => {
  try {
    const { _id, totals, items ,gstin} = req.body;

    if (!_id || !totals || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const quotation = await Quotation.create({
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
      quotation.items.push(newItem._id);
    }

    await quotation.save();
    res.status(201).json({ message: 'Quotation generated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({}).populate('user').populate('items').sort('-createdAt');
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};

export const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('user items');
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    res.json({ data: quotation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotation' });
  }
};

export const updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { totals, items, gstin } = req.body;

    if (!id || !totals || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const quotation = await Quotation.findById(id).populate('items');
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    const oldItemIds = quotation.items.map((item) => item._id);
    await Item.deleteMany({ _id: { $in: oldItemIds } });

    quotation.items = [];
    for (const item of items) {
      const newItem = await Item.create(item);
      quotation.items.push(newItem._id);
    }

    quotation.totals = totals;

    const user = await Lead.findById(quotation.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (gstin) {
      user.gstin = gstin;
      await user.save();
    }

    await quotation.save();

    res.status(200).json({
      message: 'Quotation updated successfully',
      data: quotation,
    });
  } catch (err) {
    console.error('Update Quotation Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const deleteQuotation = async (req, res) => {
  try {
    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quotation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quotation' });
  }
};
