const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 30 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    icon: { type: String, required: true, trim: true, maxlength: 16, default: '📦' },
  },
  { timestamps: true },
);

categorySchema.index(
  { user: 1, type: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);

module.exports = mongoose.model('Category', categorySchema);
