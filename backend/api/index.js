let dependencies = null;

function loadDependencies() {
  if (!dependencies) {
    dependencies = {
      app: require('../src/app'),
      connectDB: require('../src/config/db').connectDB,
      errorHandler: require('../src/middleware/errorHandler').errorHandler,
    };
  }
  return dependencies;
}

function configurationError(res, error) {
  console.error('Backend configuration failed:', error);
  if (res.headersSent) return res.end();
  return res.status(500).json({
    success: false,
    error: {
      code: 'BACKEND_CONFIGURATION_ERROR',
      message: 'Backend configuration is invalid. Check the serverless logs.',
    },
  });
}

module.exports = async function handler(req, res) {
  let deps;
  try {
    deps = loadDependencies();
  } catch (error) {
    return configurationError(res, error);
  }

  try {
    await deps.connectDB();
    return deps.app(req, res);
  } catch (error) {
    console.error('Serverless request failed:', error);
    if (res.headersSent) return res.end();
    return deps.errorHandler(error, req, res, () => {});
  }
};
