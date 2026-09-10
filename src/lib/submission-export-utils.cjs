const ExcelJS = require('exceljs');

function escapeCsv(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function columnsForRows(rows) {
  return [...new Set(rows.flatMap((row) => Object.keys(row)))];
}

function buildSubmissionCsv(rows = []) {
  const columns = columnsForRows(rows);
  if (!columns.length) return '';
  return `${[
    columns.map(escapeCsv).join(','),
    ...rows.map((row) =>
      columns.map((column) => escapeCsv(row[column])).join(',')
    ),
  ].join('\n')}\n`;
}

async function buildSubmissionExcel(rows = [], sheetName = 'Submissions') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TASI Admin';
  const worksheet = workbook.addWorksheet(String(sheetName).slice(0, 31));
  const columns = columnsForRows(rows);
  worksheet.columns = columns.map((column) => ({
    header: column,
    key: column,
    width: Math.min(Math.max(column.length + 2, 16), 50),
  }));
  rows.forEach((row) => worksheet.addRow(row));
  if (columns.length) {
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    worksheet.autoFilter = {
      from: 'A1',
      to: { row: 1, column: columns.length },
    };
    worksheet.getRow(1).font = { bold: true };
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

module.exports = { buildSubmissionCsv, buildSubmissionExcel };
