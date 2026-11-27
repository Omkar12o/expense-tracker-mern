const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    targetAmount: { type: Number, required: true, min: 0.01 },
    currentAmount: { type: Number, required: true, default: 0, min: 0 },
    targetDate: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        ret.progress = Math.floor((ret.currentAmount / ret.targetAmount) * 100);
        ret.completed = ret.currentAmount >= ret.targetAmount;
        ret.targetDate = ret.targetDate ? new Date(ret.targetDate).toISOString().slice(0, 10) : null;
        return ret;
      },
    },
  },
);

module.exports = mongoose.model('Goal', goalSchema);
