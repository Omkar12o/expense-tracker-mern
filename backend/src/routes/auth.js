const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');
const recurringTrigger = require('../middleware/recurringTrigger');
const { loginSchema, registerSchema } = require('../validators/auth');

const router = express.Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);

router.use(protect);
router.use(recurringTrigger);
router.get('/me', validate(), authController.me);
router.post('/logout', validate(), authController.logout);

module.exports = router;
