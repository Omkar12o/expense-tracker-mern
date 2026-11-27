const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const recurringTrigger = require('../middleware/recurringTrigger');
const { analyticsQuerySchema } = require('../validators/analytics');

const router = express.Router();

router.use(protect);
router.use(recurringTrigger);

router.get('/', validate({ query: analyticsQuerySchema }), analyticsController.get);

module.exports = router;
