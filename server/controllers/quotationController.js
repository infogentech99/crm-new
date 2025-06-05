import Quotation from '../models/Quotation.js';
import Lead      from '../models/Lead.js';



export const submitQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;           

    const items = req.body.items
      ? JSON.parse(req.body.items)
      : [];
    const terms = req.body.terms || '';

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const quote = await Quotation.create({
      lead: id,
      items,
      terms,
      fileUrl,
      status: 'quotation_submitted'
    });

    await Lead.findByIdAndUpdate(id, { status: 'quotation_submitted' });

    res.status(201).json(quote);
  } catch (err) {
    console.error('submitQuotation error:', err);
    next(err);
  }
};

export const approveQuotation = async (req, res, next) => {
  try {
    const { qid } = req.params;
    const quote = await Quotation.findByIdAndUpdate(
      qid,
      { status: 'quotation_approved' },
      { new: true }
    );
    if (!quote) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    await Lead.findByIdAndUpdate(quote.lead, { status: 'quotation_approved' });
    res.json(quote);
  } catch (err) {
    console.error('approveQuotation error:', err);
    next(err);
  }
};

export const listQuotations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = {};

    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Quotation.countDocuments(query);
    const quotations = await Quotation.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      quotations,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalQuotations: total,
    });
  } catch (err) {
    console.error('listQuotations error:', err);
    next(err);
  }
};
