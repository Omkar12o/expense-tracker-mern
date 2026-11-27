const express = require('express');
const cronController = require('../controllers/cronController');

const router = express.Router();

router.get('/recurring', cronController.run);
router.post('/recurring', cronController.run);

module.exports = router;
