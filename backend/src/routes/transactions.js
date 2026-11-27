const express = require('express');
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { withTransactionDefaults } = require('../middleware/defaults');
const {
  createTransactionSchema,
  patchTransactionSchema,
  listTransactionsQuerySchema,
  idParamSchema,
} = require('../validators/transaction');

const router = express.Router();

router.use(protect);

router.get('/', validate({ query: listTransactionsQuerySchema }), transactionController.list);
router.get('/export', validate({ query: listTransactionsQuerySchema }), transactionController.exportCsv);
router.get('/:id', validate({ params: idParamSchema }), transactionController.getById);
router.post(
  '/',
  withTransactionDefaults,
  validate({ body: createTransactionSchema }),
  transactionController.create,
);
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: patchTransactionSchema }),
  transactionController.update,
);
router.delete('/:id', validate({ params: idParamSchema }), transactionController.remove);

module.exports = router;
