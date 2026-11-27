const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { env } = require('./config/env');
const healthController = require('./controllers/healthController');
const routes = require('./routes');
const sanitize = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimiters');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.CLIENT_URL.includes(origin)) return callback(null, true);
      return callback(new AppError(403, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed.'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    credentials: false,
  }),
);

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false, limit: '256kb' }));
app.use(sanitize);

if (env.NODE_ENV !== 'test') app.use(morgan('combined'));

app.get('/health', healthController.check);

app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
