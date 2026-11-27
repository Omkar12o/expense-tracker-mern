const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCategorySchema, idParamSchema } = require('../validators/category');
const recurringTrigger = require('../middleware/recurringTrigger');

const router = express.Router();

router.use(protect);
router.use(recurringTrigger);

router.get('/', validate(), categoryController.list);
router.post('/', validate({ body: createCategorySchema }), categoryController.create);
router.delete('/:id', validate({ params: idParamSchema }), categoryController.remove);

module.exports = router;
