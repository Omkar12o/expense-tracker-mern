const mongoose = require('mongoose');
const { RECURRENCE_FREQUENCIES } = require('../utils/constants');

const recurrenceSchema = new mongoose.Schema(
  {
    frequency: { type: String, enum: RECURRENCE_FREQUENCIES, required: true },
    nextDate: { type: Date, required: true },
    anchorDay: { type: Number, min: 1, max: 31, required: true },
    endDate: { type: Date, default: null },
  },
  { _id: false },
);

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true, maxlength: 30 },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    note: { type: String, trim: true, maxlength: 200, default: '' },
    date: { type: Date, required: true },
    attachment: { type: String, trim: true, maxlength: 500, default: null },
    isRecurring: { type: Boolean, default: false, index: true },
    recurrence: { type: recurrenceSchema, default: null },
    recurringSource: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },
  },
  { timestamps: true },
);

transactionSchema.index({ user: 1, date: -1, _id: -1 });
transactionSchema.index({ user: 1, type: 1, category: 1, date: -1 });
transactionSchema.index({ user: 1, account: 1 });
transactionSchema.index({ isRecurring: 1, 'recurrence.nextDate': 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
