import User    from '../models/User.js';
import bcrypt  from 'bcryptjs';
import Lead    from '../models/Lead.js';
import Meeting from '../models/Meeting.js';
import Task    from '../models/Task.js';

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, roleFilter } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    // only superadmin can access all users
    if (req.user.role !== 'superadmin') {
      const me = await User.findById(req.user._id).select('-password');
      return res.json([me]);
    }

    if (roleFilter === "true") {
      query.role = { $in: ["salesperson", "admin", "superadmin"] };
    }

    const [users, total] = await Promise.all([
      User.find(query).select("-password").skip(skip).limit(Number(limit)),
      User.countDocuments(query),
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


// POST /api/users        — create a new admin or salesperson (superadmin only)
export const createUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { name, email, password, role } = req.body;
    if (!['admin','salesperson','employee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash, role });
    res
      .status(201)
      .json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id     — view one user (superadmin only)
export const getUserById = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id     — update name/email/role (superadmin only)
export const updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.name  = name  ?? user.name;
    user.email = email ?? user.email;
    user.role  = role  ?? user.role;
    await user.save();
    res.json({ message: 'User updated' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id  — remove user (superadmin only)
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/activities  — all activity (leads, meetings, tasks) (superadmin only)
export const getUserActivities = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const userId = req.params.id;

    const leads = await Lead.find({ createdBy: userId }).sort('-createdAt');
    const meetings = await Meeting.find({ createdBy: userId }).sort('-date');
    const tasks = await Task.find({ createdBy: userId }).sort('-created');
    return res.json({ leads, meetings, tasks });
  } catch (err) {
    next(err);
  }
};
