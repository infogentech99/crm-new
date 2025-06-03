import Meeting from '../models/Meeting.js';

export const getAllMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find().sort('-created');
    res.json(meetings);
  } catch (err) { next(err); }
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
