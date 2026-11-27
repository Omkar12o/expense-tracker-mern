const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const recurringTrigger = require('../middleware/recurringTrigger');

const router = express.Router();

router.use(protect);
router.use(recurringTrigger);

router.get('/', validate(), dashboardController.get);

module.exports = router;
