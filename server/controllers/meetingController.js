import Meeting from '../models/Meeting.js';

export const getAllMeetings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        // Assuming participants can be searched by name/email if populated
        // { 'participants.name': { $regex: search, $options: 'i' } },
        // { 'participants.email': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Meeting.countDocuments(query);
    const meetings = await Meeting.find(query)
      .populate({ path: 'participants', select: 'name email phone' }) // Populate participants with relevant fields
      .populate({ path: 'createdBy', select: 'name email' }) // Populate createdBy with relevant fields
      .sort('-createdAt') // Assuming 'createdAt' is the field for sorting, not 'created'
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      meetings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMeetings: total,
    });
  } catch (err) {
    console.error('getAllMeetings error:', err);
    next(err);
  }
};

export const getMeeting = async (req, res, next) => {
  try {
    const m = await Meeting.findById(req.params.id);
    if (!m) return res.status(404).json({ message: 'Not found' });
    res.json(m);
  } catch (err) { next(err); }
};

export const createMeeting = async (req, res, next) => {
  try {
    
    const userId = req.user.id;
    const payload = {
      ...req.body,
      createdBy: userId
    };
    const meeting = await Meeting.create(payload);
    res.status(201).json({
      meeting,
      userId
    });
  } catch (err) {
    next(err);
  }
};

export const updateMeeting = async (req, res, next) => {
  try {
    const m = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(m);
  } catch (err) { next(err); }
};

export const deleteMeeting = async (req, res, next) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
