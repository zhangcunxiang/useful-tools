const Fastify = require('fastify');
const cors = require('@fastify/cors');
const jwt = require('jsonwebtoken');
const { DateTime } = require('luxon');

const buildServer = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: (origin, cb) => {
      cb(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  app.get('/api/health', async () => {
    return { ok: true };
  });

  app.get('/api/timestamp/now', async (req) => {
    const unit = (req.query && req.query.unit) || 'ms';
    const nowMs = Date.now();
    return {
      timestamp_ms: nowMs,
      timestamp_s: Math.floor(nowMs / 1000),
      unit: unit === 's' ? 's' : 'ms',
    };
  });

  app.post('/api/timestamp/to-date', async (req, reply) => {
    try {
      const { timestamp, unit = 'ms', tz = 'UTC' } = req.body || {};
      if (timestamp === undefined || timestamp === null || timestamp === '') {
        reply.code(400);
        return { error: 'timestamp is required' };
      }
      const num = Number(timestamp);
      if (!Number.isFinite(num)) {
        reply.code(400);
        return { error: 'timestamp must be a number' };
      }
      const ms = unit === 's' ? num * 1000 : num;
      const dt = DateTime.fromMillis(ms, { zone: 'utc' }).setZone(tz);
      if (!dt.isValid) {
        reply.code(400);
        return { error: `Invalid timezone: ${tz}` };
      }
      const formatted = dt.toFormat('yyyy-LL-dd HH:mm:ss');
      return {
        iso: dt.toISO(),
        formatted,
        zone: dt.zoneName,
        offsetMinutes: dt.offset,
        parts: {
          year: dt.year,
          month: dt.month,
          day: dt.day,
          hour: dt.hour,
          minute: dt.minute,
          second: dt.second,
          millisecond: dt.millisecond,
        },
      };
    } catch (e) {
      req.log.error(e);
      reply.code(500);
      return { error: 'Internal error' };
    }
  });

  app.post('/api/timestamp/from-date', async (req, reply) => {
    try {
      const { date, tz = 'UTC', format } = req.body || {};
      if (!date) {
        reply.code(400);
        return { error: 'date is required' };
      }
      let dt;
      if (format) {
        dt = DateTime.fromFormat(String(date), String(format), { zone: tz });
      } else {
        dt = DateTime.fromISO(String(date), { zone: tz });
        if (!dt.isValid) {
          dt = DateTime.fromSQL(String(date), { zone: tz });
        }
        if (!dt.isValid) {
          dt = DateTime.fromFormat(String(date), 'yyyy-LL-dd HH:mm:ss', { zone: tz });
        }
      }
      if (!dt.isValid) {
        reply.code(400);
        return { error: 'Unable to parse date', reason: dt.invalidReason, explanation: dt.invalidExplanation };
      }
      return {
        timestamp_ms: dt.toMillis(),
        timestamp_s: Math.floor(dt.toMillis() / 1000),
        iso: dt.toUTC().toISO(),
        zone: dt.zoneName,
      };
    } catch (e) {
      req.log.error(e);
      reply.code(500);
      return { error: 'Internal error' };
    }
  });

  app.post('/api/jwt/decode', async (req, reply) => {
    try {
      const { token } = req.body || {};
      if (!token || typeof token !== 'string') {
        reply.code(400);
        return { error: 'token is required' };
      }
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded) {
        reply.code(400);
        return { error: 'Invalid token' };
      }
      const parts = token.split('.');
      const sig = parts.length === 3 ? parts[2] : null;
      return {
        header: decoded.header || null,
        payload: decoded.payload || null,
        signature: sig,
      };
    } catch (e) {
      req.log.error(e);
      reply.code(500);
      return { error: 'Internal error' };
    }
  });

  app.post('/api/jwt/encode', async (req, reply) => {
    try {
      const { payload, secret, algorithm = 'HS256' } = req.body || {};
      if (!payload || typeof payload !== 'object') {
        reply.code(400);
        return { error: 'payload must be a JSON object' };
      }
      if (!secret || typeof secret !== 'string') {
        reply.code(400);
        return { error: 'secret is required' };
      }
      if (algorithm !== 'HS256') {
        reply.code(400);
        return { error: 'Only HS256 is supported' };
      }
      const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
      return { token };
    } catch (e) {
      req.log.error(e);
      reply.code(500);
      return { error: 'Internal error' };
    }
  });

  return app;
};

if (require.main === module) {
  const start = async () => {
    const app = buildServer();
    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    const host = '0.0.0.0';
    try {
      await app.listen({ port, host });
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };

  start();
}

module.exports = buildServer;
