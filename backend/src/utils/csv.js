const { todayUTC } = require('./dates');

const CSV_HEADER = 'Date,Type,Category,Account,Amount,Note';

function escapeCsvCell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

function csvRow(cells) {
  return cells.map(escapeCsvCell).join(',');
}

function setCsvHeaders(res) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="transactions-${todayUTC()}.csv"`,
  );
}

async function streamCsv(res, rows) {
  setCsvHeaders(res);
  res.write(`${CSV_HEADER}\r\n`);

  for await (const row of rows) {
    if (res.destroyed) break;
    res.write(`${csvRow(row)}\r\n`);
  }

  res.end();
}

module.exports = { CSV_HEADER, escapeCsvCell, csvRow, setCsvHeaders, streamCsv };
