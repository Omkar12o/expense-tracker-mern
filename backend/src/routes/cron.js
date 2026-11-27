const express = require('express');
const cronController = require('../controllers/cronController');
const { protectCron } = require('../middleware/cronAuth');

const router = express.Router();

router.use(protectCron);
router.get('/recurring', cronController.run);
router.post('/recurring', cronController.run);

module.exports = router;
