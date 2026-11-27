const HEALTH_PATHS = new Set(['/health', '/api/health']);

let dependencies = null;

function loadDependencies() {
  if (!dependencies) {
    dependencies = {
      app: require('../src/app'),
      connectDB: require('../src/config/db').connectDB,
    };
  }
  return dependencies;
}

function requestPath(req) {
  return String(req.url || '/')
    .split('?')[0]
    .replace(/\/+$/, '')
    .toLowerCase() || '/';
}

function isHealthRequest(req) {
  return HEALTH_PATHS.has(requestPath(req));
}

// Vercel supplies a raw Node response, not an Express response.
function sendJson(res, statusCode, body) {
  if (res.headersSent) return res.end();
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

function fail(res, statusCode, code, message) {
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
    return fail(res, 500, 'BACKEND_CONFIGURATION_ERROR', 'Backend configuration is invalid. Check the serverless logs.');
  }

  // Health checks must stay available even when Atlas is unreachable.
  if (!isHealthRequest(req)) {
    try {
      await deps.connectDB();
    } catch (error) {
      console.error('Database connection failed:', error);
      return fail(res, 503, 'DATABASE_UNAVAILABLE', 'Database is temporarily unavailable.');
    }
  }

  try {
    return deps.app(req, res);
  } catch (error) {
    console.error('Serverless request failed:', error);
    return fail(res, 500, 'INTERNAL_ERROR', 'Something went wrong. Please try again later.');
  }
};
