const express = require('express');
const authRoutes = require('./auth');
const transactionRoutes = require('./transactions');
const accountRoutes = require('./accounts');
const categoryRoutes = require('./categories');
const budgetRoutes = require('./budgets');
const goalRoutes = require('./goals');
const analyticsRoutes = require('./analytics');
const dashboardRoutes = require('./dashboard');
const cronRoutes = require('./cron');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cron', cronRoutes);
router.use('/transactions', transactionRoutes);
router.use('/accounts', accountRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
