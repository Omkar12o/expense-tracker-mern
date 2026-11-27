const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    category: { type: String, default: null, trim: true, maxlength: 30 },
    amount: { type: Number, required: true, min: 0.01 },
  },
  { timestamps: true },
);

budgetSchema.index(
  { user: 1, month: 1, category: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);

module.exports = mongoose.model('Budget', budgetSchema);
