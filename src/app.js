const path = require('path');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { env } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error');
const { csrfProtection } = require('./middleware/csrf');

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(hpp());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 400, standardHeaders: true, legacyHeaders: false }));
if (env.nodeEnv !== 'test') app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: env.nodeEnv === 'production' ? '1d' : 0,
  etag: true
}));

app.get('/health', (req, res) => res.json({ ok: true, name: 'VEGI14', env: env.nodeEnv }));
app.use(csrfProtection);
app.use('/api', routes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
