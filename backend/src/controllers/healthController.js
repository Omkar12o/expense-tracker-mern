const RESPONSE = { success: true, status: 'ok', data: { status: 'ok' } };

function check(_req, res) {
  return res.status(200).json(RESPONSE);
}

module.exports = { check };
