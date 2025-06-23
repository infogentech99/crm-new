// File: server/controllers/userController.js

import User    from '../models/User.js';
import bcrypt  from 'bcryptjs';
import Lead    from '../models/Lead.js';
import Meeting from '../models/Meeting.js';
import Task    from '../models/Task.js';

export const getUsers = async (req, res, next) => {
  try {
    const page       = parseInt(req.query.page, 10)  || 1;
    const limit      = parseInt(req.query.limit, 10) || 10;
    const { roleFilter, search } = req.query;
    const skip       = (page - 1) * limit;

    const filter = {};
    if (roleFilter && roleFilter !== 'all') {
      filter.role = roleFilter;
    }
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    let query = User.find(filter).skip(skip).limit(limit);

    if (req.user.role !== 'superadmin') {
      query = query.select('_id name email');
    } else {
      query = query.select('-password');
    }

    const [users, total] = await Promise.all([
      query.exec(),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};


export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!['admin','salesperson','employee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash, role });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
};


export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};


export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name)  user.name  = name;
    if (email) user.email = email;
    if (role)  user.role  = role;

    await user.save();
    res.json({ message: 'User updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};


export const getUserActivities = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const [leads, meetings, tasks] = await Promise.all([
      Lead.find({ createdBy: userId }).sort('-createdAt'),
      Meeting.find({ createdBy: userId }).sort('-date'),
      Task.find({ createdBy: userId }).sort('-created'),
    ]);

    res.json({ leads, meetings, tasks });
  } catch (err) {
    next(err);
  }
};
