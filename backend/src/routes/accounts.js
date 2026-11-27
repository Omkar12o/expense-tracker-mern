const express = require('express');
const accountController = require('../controllers/accountController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { withAccountDefaults } = require('../middleware/defaults');
const recurringTrigger = require('../middleware/recurringTrigger');
const { createAccountSchema, patchAccountSchema, idParamSchema } = require('../validators/account');

const router = express.Router();

router.use(protect);
router.use(recurringTrigger);

router.get('/', validate(), accountController.list);
router.post(
  '/',
  withAccountDefaults,
  validate({ body: createAccountSchema }),
  accountController.create,
);
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: patchAccountSchema }),
  accountController.update,
);
router.delete('/:id', validate({ params: idParamSchema }), accountController.remove);

module.exports = router;
