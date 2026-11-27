function sendSuccess(res, data, options = {}) {
  const { status = 200, message, ...meta } = options;
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(status).json({ ...body, ...meta });
}

module.exports = { sendSuccess };
