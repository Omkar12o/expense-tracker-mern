const express = require('express');
const authRoutes = require('./auth');
const transactionRoutes = require('./transactions');
const accountRoutes = require('./accounts');
const categoryRoutes = require('./categories');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/accounts', accountRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
