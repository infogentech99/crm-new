import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'TokenExpiredError') {
      console.error(
        `Token expired at ${err.expiredAt.toISOString()} — token was:`,
        token
      );
      return res
        .status(401)
        .json({ message: 'Session expired. Please log in again.' });
    }
    console.error('Invalid token. Details:', err.message, 'Token:', token);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('authorizing role=', req.user?.role, 'allowed=', allowedRoles);
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    // superadmin bypass
    if (req.user.role === 'superadmin') {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};

