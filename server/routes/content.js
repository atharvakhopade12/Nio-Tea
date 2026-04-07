const express = require('express');
const router  = express.Router();
const { getSection, getAllContent } = require('../controllers/contentController');

router.get('/',         getAllContent);
router.get('/:section', getSection);

module.exports = router;
