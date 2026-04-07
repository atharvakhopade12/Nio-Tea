const express = require('express');
const { getProducts, getProductBySlug, getFilters } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Optional auth — prices visible only if logged in
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {
      req.user = null;
    }
  }
  next();
};

router.get('/filters', getFilters);
router.get('/', optionalAuth, getProducts);
router.get('/:slug', optionalAuth, getProductBySlug);

module.exports = router;
