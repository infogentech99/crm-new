const User    = require('../models/User');
const Lead    = require('../models/Lead');
const Meeting = require('../models/Meeting');
const Task    = require('../models/Task');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserActivities = async (req, res) => {
  const userId = req.params.id;
  try {
    const [leads, meetings, tasks] = await Promise.all([
      Lead.find({ createdBy: userId }).sort('-createdAt'),
      Meeting.find({ participants: userId }).sort('-date'),
      Task.find({ assignee: userId }).sort('-created'),
    ]);
    res.json({ leads, meetings, tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
