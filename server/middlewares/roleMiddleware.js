module.exports.isSuperadmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden: superadmin only' });
    }
    next();
  };
  