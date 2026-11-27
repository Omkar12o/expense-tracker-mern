const mongoose = require('mongoose');
const { z } = require('zod');
const { isValidDateString, isValidMonthString } = require('../utils/dates');
const { roundMoney } = require('../utils/text');

const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid 24-character hex id.');

function toObjectId(value) {
  return new mongoose.Types.ObjectId(value);
}

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .pipe(z.string().email('Enter a valid email address.'));

const dateString = z.string().refine(isValidDateString, 'Use a valid UTC calendar date (YYYY-MM-DD).');

const monthString = z.string().refine(isValidMonthString, 'Use a valid month (YYYY-MM).');

const money = z
  .number({ invalid_type_error: 'Amount must be a number.' })
  .finite()
  .nonnegative('Amount cannot be negative.')
  .max(1000000000, 'Amount is too large.')
  .transform(roundMoney)
  .refine((value) => value >= 0.01, 'Amount must be at least 0.01.');

const amountFilter = z
  .number({ invalid_type_error: 'Amount must be a number.' })
  .finite()
  .nonnegative('Amount cannot be negative.')
  .max(1000000000, 'Amount is too large.')
  .transform(roundMoney);

const httpUrl = z
  .string()
  .trim()
  .max(500)
  .url('Enter a valid URL.')
  .refine((value) => /^https?:\/\//i.test(value), 'Only http(s) links are allowed.');

const shortText = (max = 200, label = 'Text') =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters.`);

module.exports = {
  objectId,
  toObjectId,
  email,
  dateString,
  monthString,
  money,
  amountFilter,
  httpUrl,
  shortText,
};
