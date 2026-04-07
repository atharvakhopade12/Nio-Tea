require('dotenv').config();

// Allow self-signed TLS certificates in development (corporate proxy / antivirus interception)
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

require('express-async-errors'); // auto-forward async errors to Express error handler
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── Init Admin (run once) ────────────────────────────────────────────────────
const seedAdmin = async () => {
  try {
    const exists = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@niotea.com' });
    if (!exists) {
      await Admin.create({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@niotea.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'superadmin',
      });
      console.log('✅ Admin account seeded.');
    }
  } catch (err) {
    // 23505 = PostgreSQL unique-constraint violation (admin already exists)
    if (err.message && !err.message.includes('23505')) {
      console.error('Admin seed error:', err.message);
    }
  }
};
seedAdmin();

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Global rate limiter — relaxed in development
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: process.env.NODE_ENV === 'production' ? 300 : 5000,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  skip: () => process.env.NODE_ENV !== 'production', // completely skip in development
}));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Uploads (local fallback when Cloudinary is not configured) ─────────
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/enquiries', require('./routes/enquiry'));
app.use('/api/content', require('./routes/content'));

// Public categories (active only)
const { getCategories } = require('./controllers/categoryController');
app.get('/api/categories', getCategories);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nio Tea API is running', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Nio Tea Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Admin Panel:  http://localhost:${PORT}/api/admin\n`);
});
