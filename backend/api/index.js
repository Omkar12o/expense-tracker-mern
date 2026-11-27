const HEALTH_PATHS = new Set(['/health', '/api/health']);

let dependencies = null;

function loadDependencies() {
  if (!dependencies) {
    dependencies = {
      app: require('../src/app'),
      connectDB: require('../src/config/db').connectDB,
      AppError: require('../src/utils/AppError'),
      env: require('../src/config/env').env,
    };
  }
  return dependencies;
}

// Vercel rewrites nested /api/* paths to /api?__original=/api/<path>.
// Restore the real path before Express routing and health detection.
function restoreOriginalUrl(req) {
  let parsed;
  try {
    parsed = new URL(req.url || '/', 'http://localhost');
  } catch {
    return false;
  }

  const values = parsed.searchParams.getAll('__original');
  if (values.length === 0) return true;
  if (values.length !== 1) return false;

  const original = values[0];
  if (!original.startsWith('/api/')) return false;
  if (original.includes('..') || original.includes('\\')) return false;
  if (/[\u0000-\u001f\u007f]/.test(original)) return false;
  if (!/^\/api\/[A-Za-z0-9/_.\-%]+$/.test(original)) return false;

  parsed.searchParams.delete('__original');
  const remaining = parsed.searchParams.toString();
  req.url = `${original}${remaining ? `?${remaining}` : ''}`;
  req.originalUrl = req.url;
  return true;
}

function requestPath(req) {
  const path = String(req.url || '/')
    .split('?')[0]
    .replace(/\/+$/, '')
    .toLowerCase();
  return path || '/';
}

function isHealthRequest(req) {
  return HEALTH_PATHS.has(requestPath(req));
}

// Errors returned before Express runs still need CORS headers so the browser can read them.
function applyCors(req, res, env) {
  const origin = req.headers && req.headers.origin;
  if (!origin || !env.CLIENT_URL.includes(origin)) return;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
}

// Vercel supplies a raw Node response, not an Express response.
function sendJson(res, statusCode, body) {
  if (res.headersSent) return res.end();
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

function fail(req, res, deps, statusCode, code, message) {
  applyCors(req, res, deps.env);
  return sendJson(res, statusCode, {
    success: false,
    error: { code, message },
  });
}

module.exports = async function handler(req, res) {
  let deps;
  try {
    deps = loadDependencies();
  } catch (error) {
    console.error('Backend configuration failed:', error);
    if (res.headersSent) return res.end();
    return sendJson(res, 500, {
      success: false,
      error: {
        code: 'BACKEND_CONFIGURATION_ERROR',
        message: 'Backend configuration is invalid. Check the serverless logs.',
      },
    });
  }

  if (!restoreOriginalUrl(req)) {
    return fail(req, res, deps, 400, 'INVALID_REQUEST_PATH', 'The request path is invalid.');
  }

  const method = String(req.method || 'GET').toUpperCase();

  // Health checks and CORS preflight must work even when Atlas is unreachable.
  // Preflight is answered by the Express CORS middleware before any DB use.
  if (!isHealthRequest(req) && method !== 'OPTIONS') {
    try {
      await deps.connectDB();
    } catch (error) {
      console.error('Database connection failed:', error);
      // Let Express produce the response so CORS/security headers are applied.
      req.dbError = deps.AppError.serviceUnavailable(
        'Database is temporarily unavailable.',
        'DATABASE_UNAVAILABLE',
      );
    }
  }

  try {
    return deps.app(req, res);
  } catch (error) {
    console.error('Serverless request failed:', error);
    return fail(req, res, deps, 500, 'INTERNAL_ERROR', 'Something went wrong. Please try again later.');
  }
};
