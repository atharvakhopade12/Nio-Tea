const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { submitEnquiry, getMyEnquiries, submitContactForm } = require('../controllers/enquiryController');

router.post('/contact', submitContactForm);   // public — no auth
router.post('/',        protect, submitEnquiry);
router.get('/my',       protect, getMyEnquiries);

module.exports = router;
