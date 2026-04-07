const Enquiry = require('../models/Enquiry');

// @desc    Submit a new enquiry or callback request
// @route   POST /api/enquiries
// @access  Authenticated user
const submitEnquiry = async (req, res) => {
  const { type, message, productId, productName } = req.body;

  if (!type || !['enquiry', 'callback'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid enquiry type.' });
  }

  const enquiry = await Enquiry.create({
    userId:      req.user._id,
    productId:   productId || null,
    productName: productName || '',
    type,
    name:    req.user.name,
    phone:   req.user.phone,
    message: message || '',
  });

  res.status(201).json({ success: true, enquiry });
};

// @desc    Get current user's enquiries
// @route   GET /api/enquiries/my
// @access  Authenticated user
const getMyEnquiries = async (req, res) => {
  const enquiries = await Enquiry.findByUser(req.user._id, 20);
  res.status(200).json({ success: true, enquiries });
};

// ─── Admin handlers ───────────────────────────────────────────────────────────

// @desc    Get all enquiries (admin)
// @route   GET /api/admin/enquiries
// @access  Admin
const adminGetEnquiries = async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  const { enquiries, total } = await Enquiry.findAdmin({
    status,
    type,
    page:  parseInt(page),
    limit: parseInt(limit),
  });
  res.status(200).json({ success: true, total, enquiries });
};

// @desc    Update enquiry status / add admin notes
// @route   PUT /api/admin/enquiries/:id
// @access  Admin
const adminUpdateEnquiry = async (req, res) => {
  const { status, adminNotes } = req.body;
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, {
    ...(status     !== undefined && { status }),
    ...(adminNotes !== undefined && { adminNotes }),
  });
  if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
  res.status(200).json({ success: true, enquiry });
};

// @desc    Get pending enquiry/callback counts for dashboard
// @route   GET /api/admin/enquiries/counts
// @access  Admin
const adminEnquiryCounts = async (req, res) => {
  const [pendingCallbacks, pendingContacts, pendingEnquiries] = await Promise.all([
    Enquiry.countDocuments({ type: 'callback', status: 'pending' }),
    Enquiry.countDocuments({ type: 'contact',  status: 'pending' }),
    Enquiry.countDocuments({ type: 'enquiry',  status: 'pending' }),
  ]);
  res.status(200).json({
    success: true,
    pendingCallbacks,
    pendingEnquiries: pendingEnquiries + pendingContacts,
  });
};

// @desc    Submit a public contact form message (no auth required)
// @route   POST /api/enquiries/contact
// @access  Public
const submitContactForm = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }
  await Enquiry.create({
    type:    'contact',
    name,
    email:   email   || '',
    phone:   phone   || '',
    subject: subject || '',
    message,
  });
  res.status(201).json({ success: true, message: 'Message received! We will get back to you within 24 hours.' });
};

module.exports = { submitEnquiry, getMyEnquiries, adminGetEnquiries, adminUpdateEnquiry, adminEnquiryCounts, submitContactForm };

