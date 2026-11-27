const express = require('express');
const budgetController = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const recurringTrigger = require('../middleware/recurringTrigger');
const { setBudgetSchema, listBudgetQuerySchema, idParamSchema } = require('../validators/budget');

const router = express.Router();

router.use(protect);
router.use(recurringTrigger);

router.get('/', validate({ query: listBudgetQuerySchema }), budgetController.list);
router.put('/', validate({ body: setBudgetSchema }), budgetController.set);
router.delete('/:id', validate({ params: idParamSchema }), budgetController.remove);

module.exports = router;
