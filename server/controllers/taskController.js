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
  } catch (err) { 
    console.error("getTask error:", err);
    next(err); 
  }
};

export const getTaskStatusSummary = async (req, res) => {
  try {
    let query = {};
    // If you want to filter by user, add this:
    // if (req.user.role !== 'superadmin') {
    //   query.createdBy = req.user._id;
    // }

    const statusSummary = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    const formattedSummary = statusSummary.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {});

    res.status(200).json(formattedSummary);
  } catch (err) {
    console.error("getTaskStatusSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getTasksDueSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    const tasksDue = await Task.countDocuments({
      status: { $in: ['Pending', 'In Progress'] },
      dueDate: { $lte: today.toISOString().split('T')[0] } // Compare with YYYY-MM-DD string
    });

    res.status(200).json({ totalTasksDue: tasksDue });
  } catch (err) {
    console.error('getTasksDueSummary error:', err);
    next(err);
  }
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
  } catch (err) { 
    console.error("createTask error:", err);
    next(err); 
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const t = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(t);
  } catch (err) { 
    console.error("updateTask error:", err);
    next(err); 
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { 
    console.error("deleteTask error:", err);
    next(err); 
  }
};
