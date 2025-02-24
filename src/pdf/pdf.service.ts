import * as PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

export async function generatePdfReport(report: {
  totalIncome: number;
  totalExpense: number;
  totalEvents: number;
  events: any[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30 });
      const buffers: Uint8Array[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('Monthly Performance Report', { align: 'center' })
        .moveDown();

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Summary:', { underline: true })
        .moveDown();

      doc.font('Helvetica').text(`Total Income: ${report.totalIncome}`);
      doc.text(`Total Expense: ${report.totalExpense}`);
      doc.text(`Total Events: ${report.totalEvents}`).moveDown();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
