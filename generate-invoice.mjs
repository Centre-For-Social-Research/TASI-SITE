import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  convertInchesToTwip,
} from 'docx';
import fs from 'fs';

const NAVY = '1a1a2e';
const RED = 'c0392b';
const GRAY = 'f7f8fa';
const LGRAY = 'e4e6ea';
const WHITE = 'ffffff';

const bold = (text, size = 20, color = '222222') =>
  new TextRun({ text, bold: true, size, color });

const normal = (text, size = 18, color = '444444') =>
  new TextRun({ text, size, color });

const small = (text, color = '888888') =>
  new TextRun({ text, size: 16, color });

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'ffffff' };
const allNoBorder = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
};

const cellBorder = (color = LGRAY) => ({
  top: { style: BorderStyle.SINGLE, size: 4, color },
  bottom: { style: BorderStyle.SINGLE, size: 4, color },
  left: { style: BorderStyle.NONE, size: 0, color: WHITE },
  right: { style: BorderStyle.NONE, size: 0, color: WHITE },
});

// ── Header row (navy bar with INVOICE title) ──────────────────────────────
const headerTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideH: noBorder,
    insideV: noBorder,
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 60, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: NAVY },
          borders: allNoBorder,
          margins: { top: 120, bottom: 120, left: 180, right: 100 },
          children: [
            new Paragraph({
              children: [bold('Mister India Travel &', 26, WHITE)],
            }),
            new Paragraph({
              children: [bold('Web Design Agency', 26, WHITE)],
            }),
            new Paragraph({
              spacing: { before: 60 },
              children: [
                small('Near Seelampur, Delhi – 110053, India', 'aaaaaa'),
              ],
            }),
            new Paragraph({
              children: [
                small(
                  'GST No.: XXXXXXXXXXX  |  info@misterindia.in  |  +91 XXXXX XXXXX',
                  'aaaaaa'
                ),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: RED },
          borders: allNoBorder,
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 100, right: 180 },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'INVOICE',
                  bold: true,
                  size: 52,
                  color: WHITE,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 60 },
              children: [small('Invoice No.:  INV-2026-XXXX', WHITE)],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [small('Invoice Date:  11 May 2026', WHITE)],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [small('Due Date:  25 May 2026', WHITE)],
            }),
          ],
        }),
      ],
    }),
  ],
});

// ── Billed To / Project ───────────────────────────────────────────────────
const metaTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideH: noBorder,
    insideV: noBorder,
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: allNoBorder,
          margins: { top: 80, bottom: 80, left: 0, right: 100 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'BILLED TO',
                  size: 14,
                  color: 'aaaaaa',
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              spacing: { before: 40 },
              children: [bold('The Centre for Social Research', 20, NAVY)],
            }),
            new Paragraph({
              children: [normal('2, Nelson Mandela Marg, Vasant Kunj,')],
            }),
            new Paragraph({ children: [normal('New Delhi – 110070, India')] }),
            new Paragraph({
              spacing: { before: 60 },
              children: [normal('Attn: '), bold('Saquib Jamil', 18, NAVY)],
            }),
            new Paragraph({
              children: [
                normal('Project Coordinator, Centre for Social Research'),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: allNoBorder,
          margins: { top: 80, bottom: 80, left: 100, right: 0 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'PROJECT DETAILS',
                  size: 14,
                  color: 'aaaaaa',
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              spacing: { before: 40 },
              children: [
                bold('TASI 2026 – Official Conference Website', 20, NAVY),
              ],
            }),
            new Paragraph({
              children: [normal('The Centre for Social Research')],
            }),
            new Paragraph({
              spacing: { before: 60 },
              children: [normal('Payment Terms: Net 15 Days')],
            }),
            new Paragraph({
              children: [normal('Currency: INR (₹)  |  SAC Code: 998314')],
            }),
          ],
        }),
      ],
    }),
  ],
});

// ── Line Items Table ──────────────────────────────────────────────────────
const thCell = (text, width, align = AlignmentType.LEFT) =>
  new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.SOLID, color: NAVY },
    borders: allNoBorder,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text, bold: true, size: 15, color: WHITE })],
      }),
    ],
  });

const itemsTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideH: noBorder,
    insideV: noBorder,
  },
  rows: [
    // Header
    new TableRow({
      tableHeader: true,
      children: [
        thCell('#', 6),
        thCell('Description of Service', 58),
        thCell('Qty', 9, AlignmentType.CENTER),
        thCell('Unit Price (₹)', 13, AlignmentType.RIGHT),
        thCell('Amount (₹)', 14, AlignmentType.RIGHT),
      ],
    }),
    // Row 1
    new TableRow({
      children: [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          borders: {
            top: noBorder,
            bottom: { style: BorderStyle.SINGLE, size: 4, color: LGRAY },
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 80, bottom: 80, left: 100, right: 60 },
          children: [new Paragraph({ children: [normal('1')] })],
        }),
        new TableCell({
          width: { size: 58, type: WidthType.PERCENTAGE },
          borders: {
            top: noBorder,
            bottom: { style: BorderStyle.SINGLE, size: 4, color: LGRAY },
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
          children: [
            new Paragraph({
              children: [
                bold(
                  'Website Design & Development – TASI 2026 Conference Website',
                  19,
                  NAVY
                ),
              ],
            }),
            new Paragraph({
              spacing: { before: 40 },
              children: [
                new TextRun({
                  text: 'Full-stack design & development of the official TASI 2026 conference website for The Centre for Social Research. Includes: event registration system (submission, review, confirmation & waitlisting) • QR code pass issuance & digital venue check-in • role-based admin dashboard with bulk actions • transactional email automation • AI-powered chatbot • blog & CMS integration • API security & rate limiting • fully responsive UI design.',
                  size: 16,
                  color: '666666',
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 9, type: WidthType.PERCENTAGE },
          borders: {
            top: noBorder,
            bottom: { style: BorderStyle.SINGLE, size: 4, color: LGRAY },
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [normal('1')],
            }),
          ],
        }),
        new TableCell({
          width: { size: 13, type: WidthType.PERCENTAGE },
          borders: {
            top: noBorder,
            bottom: { style: BorderStyle.SINGLE, size: 4, color: LGRAY },
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [normal('60,000.00')],
            }),
          ],
        }),
        new TableCell({
          width: { size: 14, type: WidthType.PERCENTAGE },
          borders: {
            top: noBorder,
            bottom: { style: BorderStyle.SINGLE, size: 4, color: LGRAY },
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 80, bottom: 80, left: 60, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [normal('60,000.00')],
            }),
          ],
        }),
      ],
    }),
  ],
});

// ── Totals ────────────────────────────────────────────────────────────────
const innerTotals = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideH: noBorder,
    insideV: noBorder,
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          borders: {
            top: noBorder,
            bottom: cellBorder().bottom,
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 50, bottom: 50, left: 0, right: 60 },
          children: [new Paragraph({ children: [normal('Subtotal')] })],
        }),
        new TableCell({
          borders: {
            top: noBorder,
            bottom: cellBorder().bottom,
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 50, bottom: 50, left: 60, right: 0 },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [normal('₹ 60,000.00')],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: {
            top: noBorder,
            bottom: cellBorder().bottom,
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 50, bottom: 50, left: 0, right: 60 },
          children: [
            new Paragraph({ children: [normal('GST @ 18%  (SAC 998314)')] }),
          ],
        }),
        new TableCell({
          borders: {
            top: noBorder,
            bottom: cellBorder().bottom,
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 50, bottom: 50, left: 60, right: 0 },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [normal('₹ 10,800.00')],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          shading: { type: ShadingType.SOLID, color: NAVY },
          borders: allNoBorder,
          margins: { top: 80, bottom: 80, left: 100, right: 60 },
          children: [
            new Paragraph({ children: [bold('Total Due', 20, WHITE)] }),
          ],
        }),
        new TableCell({
          shading: { type: ShadingType.SOLID, color: NAVY },
          borders: allNoBorder,
          margins: { top: 80, bottom: 80, left: 60, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [bold('₹ 70,800.00', 20, WHITE)],
            }),
          ],
        }),
      ],
    }),
  ],
});

// Wrap in a 2-col table: spacer left (60%) + totals right (40%)
const totalsTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideH: noBorder,
    insideV: noBorder,
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 60, type: WidthType.PERCENTAGE },
          borders: allNoBorder,
          children: [new Paragraph({ children: [] })],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          borders: allNoBorder,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          children: [innerTotals],
        }),
      ],
    }),
  ],
});

// ── Bank + Notes ──────────────────────────────────────────────────────────
const bankRow = (label, value) =>
  new TableRow({
    children: [
      new TableCell({
        borders: {
          top: noBorder,
          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'eeeeee' },
          left: noBorder,
          right: noBorder,
        },
        margins: { top: 50, bottom: 50, left: 120, right: 60 },
        children: [new Paragraph({ children: [small(label)] })],
      }),
      new TableCell({
        borders: {
          top: noBorder,
          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'eeeeee' },
          left: noBorder,
          right: noBorder,
        },
        margins: { top: 50, bottom: 50, left: 60, right: 120 },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [bold(value, 17, NAVY)],
          }),
        ],
      }),
    ],
  });

const noteRow = (text) =>
  new TableRow({
    children: [
      new TableCell({
        borders: {
          top: noBorder,
          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'eeeeee' },
          left: noBorder,
          right: noBorder,
        },
        margins: { top: 50, bottom: 50, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: '–  ' + text, size: 17, color: '444444' }),
            ],
          }),
        ],
      }),
    ],
  });

const bankBox = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideH: noBorder,
    insideV: noBorder,
  },
  rows: [
    new TableRow({
      children: [
        // Bank details
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: 'f7f8fa' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: NAVY },
            bottom: noBorder,
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 0, bottom: 0, left: 0, right: 80 },
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: noBorder,
                bottom: noBorder,
                left: noBorder,
                right: noBorder,
                insideH: noBorder,
                insideV: noBorder,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      borders: allNoBorder,
                      margins: { top: 80, bottom: 60, left: 120, right: 120 },
                      columnSpan: 2,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'BANK ACCOUNT DETAILS',
                              size: 14,
                              bold: true,
                              color: 'aaaaaa',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                bankRow(
                  'Account Name',
                  'Mister India Travel & Web Design Agency'
                ),
                bankRow('Account No.', 'XXXX XXXX XXXX'),
                bankRow('Bank Name', 'XXXX Bank'),
                bankRow('Branch', 'Seelampur, Delhi'),
                bankRow('IFSC Code', 'XXXX0000000'),
                bankRow('Account Type', 'Current'),
              ],
            }),
          ],
        }),
        // Notes
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: 'f7f8fa' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: RED },
            bottom: noBorder,
            left: noBorder,
            right: noBorder,
          },
          margins: { top: 0, bottom: 0, left: 80, right: 0 },
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: noBorder,
                bottom: noBorder,
                left: noBorder,
                right: noBorder,
                insideH: noBorder,
                insideV: noBorder,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      borders: allNoBorder,
                      margins: { top: 80, bottom: 60, left: 120, right: 120 },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'PAYMENT NOTES',
                              size: 14,
                              bold: true,
                              color: 'aaaaaa',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                noteRow('Payment is due within 15 days of the invoice date.'),
                noteRow(
                  'Quote invoice no. INV-2026-XXXX in all payment transfers.'
                ),
                noteRow('GST @ 18% levied under SAC Code 998314.'),
                noteRow('Billing enquiries: info@misterindia.in'),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});

// ── Footer ────────────────────────────────────────────────────────────────
const footerTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 4, color: LGRAY },
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideH: noBorder,
    insideV: noBorder,
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 60, type: WidthType.PERCENTAGE },
          borders: allNoBorder,
          margins: { top: 80, bottom: 80, left: 0, right: 60 },
          children: [
            new Paragraph({
              children: [
                small(
                  'This is a system-generated invoice and does not require a physical signature.'
                ),
              ],
            }),
            new Paragraph({
              children: [
                small(
                  'We appreciate the opportunity to serve you and look forward to a continued partnership.'
                ),
              ],
            }),
            new Paragraph({
              spacing: { before: 40 },
              children: [
                new TextRun({
                  text: 'Mister India Travel & Web Design Agency  |  Near Seelampur, Delhi – 110053',
                  size: 15,
                  color: 'aaaaaa',
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          borders: allNoBorder,
          margins: { top: 80, bottom: 80, left: 60, right: 0 },
          verticalAlign: VerticalAlign.BOTTOM,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: '_______________________________',
                  color: '999999',
                  size: 18,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [small('Authorised Signatory')],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                bold('Mister India Travel & Web Design Agency', 17, '555555'),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});

// ── Document ──────────────────────────────────────────────────────────────
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: {
            width: convertInchesToTwip(8.27),
            height: convertInchesToTwip(11.69),
          },
          margin: {
            top: 0,
            bottom: convertInchesToTwip(0.3),
            left: convertInchesToTwip(0.6),
            right: convertInchesToTwip(0.6),
          },
        },
      },
      children: [
        headerTable,
        new Paragraph({ spacing: { before: 200 } }),
        metaTable,
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 4, color: LGRAY },
          },
          spacing: { before: 100, after: 160 },
          children: [],
        }),
        itemsTable,
        totalsTable,
        new Paragraph({ spacing: { before: 160, after: 0 } }),
        bankBox,
        new Paragraph({ spacing: { before: 200 } }),
        footerTable,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('invoice.docx', buffer);
  console.log('invoice.docx created successfully.');
});
