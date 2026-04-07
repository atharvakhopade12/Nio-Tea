const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin access denied. No token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.admin = await Admin.findById(decoded.id); // password excluded by default
    if (!req.admin || !req.admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin not found or deactivated.' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Admin token invalid or expired.' });
  }
};

// Only superadmin can access — must be used AFTER adminProtect
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Superadmin access required.' });
  }
  next();
};

module.exports = { adminProtect, requireSuperAdmin };
