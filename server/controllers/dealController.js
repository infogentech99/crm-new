import Deal from '../models/Deal.js';

export const createDeal = async (req, res, next) => {
  try {
    const deal = await Deal.create(req.body);
    res.status(201).json(deal);
  } catch (err) {
    next(err);
  }
};

export const getDeals = async (req, res, next) => {
  try {
    const deals = await Deal.find().populate('lead');
    res.json(deals);
  } catch (err) {
    next(err);
  }
};