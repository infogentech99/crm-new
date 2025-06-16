import Task from '../models/Task.js';

export const getAllTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'assignee.name': { $regex: search, $options: 'i' } }, // Assuming assignee is populated
      ];
    }
    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate({ path: 'assignee', select: 'name email' }) // Populate assignee with name and email
      .populate({ path: 'createdBy', select: 'name email' }) // Populate createdBy with name and email
      .sort('-createdAt') 
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      tasks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
    });
  } catch (err) {
    console.error('getAllTasks error:', err);
    next(err);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (err) { next(err); }
};

export const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payload = {
      ...req.body,
      createdBy: userId
    };

    const t = await Task.create(payload);
    res.status(201).json(t);
  } catch (err) { next(err); }
};

export const updateTask = async (req, res, next) => {
  try {
    const t = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(t);
  } catch (err) { next(err); }
};

export const deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
