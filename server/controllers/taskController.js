import Task from '../models/Task.js';

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort('dueDate');
    res.json(tasks);
  } catch (err) { next(err); }
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
