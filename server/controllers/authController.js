
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isEmail, minLength, isStrongPassword } from '../utils/validators.js';

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    // { expiresIn: '1d' }
  );

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Name validation
    if (!minLength(name, 3)) {
      return res.status(400).json({ message: 'Name must be at least 3 characters long.' });
    }

    // Email validation
    if (!isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Password validation
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash, role });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name, email, role },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}
