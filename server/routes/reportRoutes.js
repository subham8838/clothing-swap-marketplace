const express = require('express');
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReportSchema } = require('../validators/reportValidator');

const router = express.Router();
router.post('/', protect, validate(createReportSchema), createReport);

module.exports = router;
