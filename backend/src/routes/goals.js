const express = require('express');
const goalController = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const recurringTrigger = require('../middleware/recurringTrigger');
const { withGoalDefaults } = require('../middleware/defaults');
const {
  createGoalSchema,
  patchGoalSchema,
  contributeSchema,
  idParamSchema,
} = require('../validators/goal');

const router = express.Router();

router.use(protect);
router.use(recurringTrigger);

router.get('/', validate(), goalController.list);
router.post('/', withGoalDefaults, validate({ body: createGoalSchema }), goalController.create);
router.post(
  '/:id/contribute',
  validate({ params: idParamSchema, body: contributeSchema }),
  goalController.contribute,
);
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: patchGoalSchema }),
  goalController.update,
);
router.delete('/:id', validate({ params: idParamSchema }), goalController.remove);

module.exports = router;
