/* Generator ekspor dokumen laporan bulanan ke PDF, DOCX, dan XLSX langsung di browser */

import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { MonthlyReport } from '../types';
import {
  buildExportFileName,
  formatDesimal,
  formatTanggalIndonesia,
} from './format';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportMonthlyReportPDF(report: MonthlyReport): string {
  const { report_content } = report;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const marginX = 15;
  let cursorY = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LAPORAN AKTIVITAS KERJA BULANAN', marginX, cursorY);
  cursorY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Periode: ${report_content.header.period_label}`, marginX, cursorY);
  cursorY += 6;
  doc.text(`Status Dokumen: ${report.status} (Personal)`, marginX, cursorY);
  cursorY += 8;

  const identityLines = [
    ['Nama', report_content.header.full_name],
    ['NIP', report_content.header.nip],
    ['Jabatan', report_content.header.job_title],
    ['Unit Kerja', report_content.header.unit_name],
  ];

  autoTable(doc, {
    startY: cursorY,
    head: [['Identitas Pegawai', 'Keterangan']],
    body: identityLines,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [29, 78, 216] },
    margin: { left: marginX, right: marginX },
  });

  cursorY =
    ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? cursorY + 30) + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Ringkasan Pelaksanaan Tugas', marginX, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const summaryLines = doc.splitTextToSize(
    report_content.executive_summary || '-',
    180
  );
  doc.text(summaryLines, marginX, cursorY);
  cursorY += summaryLines.length * 4.5 + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Rekap Aktivitas Harian', marginX, cursorY);
  cursorY += 3;

  autoTable(doc, {
    startY: cursorY,
    head: [['No', 'Tanggal', 'Kegiatan', 'Output / Hasil', 'Target Kinerja']],
    body:
      report_content.activity_rows.length > 0
        ? report_content.activity_rows.map((row, idx) => [
            String(idx + 1),
            formatTanggalIndonesia(row.activity_date),
            row.title,
            row.output_text,
            row.target_title,
          ])
        : [['-', '-', 'Tidak ada aktivitas tercatat pada periode ini.', '-', '-']],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2 },
    headStyles: { fillColor: [29, 78, 216] },
    margin: { left: marginX, right: marginX },
  });

  cursorY =
    ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? cursorY + 25) + 8;

  if (cursorY > 250) {
    doc.addPage();
    cursorY = 18;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Capaian Target Kinerja', marginX, cursorY);
  cursorY += 3;

  autoTable(doc, {
    startY: cursorY,
    head: [
      [
        'Target Kinerja',
        'Indikator',
        'Target',
        'Realisasi Tercatat',
        'Aktivitas Pendukung',
      ],
    ],
    body:
      report_content.target_rows.length > 0
        ? report_content.target_rows.map((row) => [
            row.title,
            row.indicator,
            row.target_display,
            row.realization_display,
            String(row.supporting_count),
          ])
        : [['-', 'Belum ada target kinerja pada periode ini.', '-', '-', '0']],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2 },
    headStyles: { fillColor: [29, 78, 216] },
    margin: { left: marginX, right: marginX },
  });

  cursorY =
    ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? cursorY + 25) + 8;

  if (cursorY > 245) {
    doc.addPage();
    cursorY = 18;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Rekap Output Tercatat', marginX, cursorY);
  cursorY += 3;

  autoTable(doc, {
    startY: cursorY,
    head: [['Satuan Output', 'Total Kuantitas', 'Jumlah Aktivitas']],
    body:
      report_content.output_recap.length > 0
        ? report_content.output_recap.map((o) => [
            o.unit,
            formatDesimal(o.total_quantity),
            String(o.activity_count),
          ])
        : [['Belum ada kuantitas output tercatat', '-', '0']],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2 },
    headStyles: { fillColor: [29, 78, 216] },
    margin: { left: marginX, right: marginX },
  });

  cursorY =
    ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? cursorY + 20) + 8;

  if (cursorY > 245) {
    doc.addPage();
    cursorY = 18;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Kendala dan Tindak Lanjut', marginX, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const challengeLines = doc.splitTextToSize(
    report_content.challenges_and_followup || '-',
    180
  );
  doc.text(challengeLines, marginX, cursorY);
  cursorY += challengeLines.length * 4.5 + 6;

  if (cursorY > 255) {
    doc.addPage();
    cursorY = 18;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Penutup', marginX, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const closingLines = doc.splitTextToSize(
    report_content.closing_note || '-',
    180
  );
  doc.text(closingLines, marginX, cursorY);

  const fileName = buildExportFileName(
    report_content.header.full_name,
    report.month,
    report.year,
    'pdf'
  );
  doc.save(fileName);
  return fileName;
}

function makeDocxCell(text: string, bold = false): TableCell {
  return new TableCell({
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'D4D4D4' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D4D4D4' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'D4D4D4' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'D4D4D4' },
    },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold, size: 20 })],
      }),
    ],
  });
}

export async function exportMonthlyReportDOCX(
  report: MonthlyReport
): Promise<string> {
  const { report_content } = report;

  const activityRows: TableRow[] = [
    new TableRow({
      children: [
        makeDocxCell('No', true),
        makeDocxCell('Tanggal', true),
        makeDocxCell('Kegiatan', true),
        makeDocxCell('Output / Hasil', true),
        makeDocxCell('Target Kinerja', true),
      ],
    }),
    ...(report_content.activity_rows.length > 0
      ? report_content.activity_rows.map(
          (row, idx) =>
            new TableRow({
              children: [
                makeDocxCell(String(idx + 1)),
                makeDocxCell(formatTanggalIndonesia(row.activity_date)),
                makeDocxCell(row.title),
                makeDocxCell(row.output_text),
                makeDocxCell(row.target_title),
              ],
            })
        )
      : [
          new TableRow({
            children: [
              makeDocxCell('-'),
              makeDocxCell('-'),
              makeDocxCell('Belum ada aktivitas tercatat'),
              makeDocxCell('-'),
              makeDocxCell('-'),
            ],
          }),
        ]),
  ];

  const targetRows: TableRow[] = [
    new TableRow({
      children: [
        makeDocxCell('Target Kinerja', true),
        makeDocxCell('Indikator', true),
        makeDocxCell('Target', true),
        makeDocxCell('Realisasi Tercatat', true),
        makeDocxCell('Aktivitas Pendukung', true),
      ],
    }),
    ...(report_content.target_rows.length > 0
      ? report_content.target_rows.map(
          (row) =>
            new TableRow({
              children: [
                makeDocxCell(row.title),
                makeDocxCell(row.indicator),
                makeDocxCell(row.target_display),
                makeDocxCell(row.realization_display),
                makeDocxCell(String(row.supporting_count)),
              ],
            })
        )
      : [
          new TableRow({
            children: [
              makeDocxCell('-'),
              makeDocxCell('Belum ada target kinerja pada periode ini'),
              makeDocxCell('-'),
              makeDocxCell('-'),
              makeDocxCell('0'),
            ],
          }),
        ]),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'LAPORAN AKTIVITAS KERJA BULANAN',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Periode: ${report_content.header.period_label} | Status: ${report.status} (Personal)`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: `Nama: ${report_content.header.full_name}` }),
          new Paragraph({ text: `NIP: ${report_content.header.nip}` }),
          new Paragraph({ text: `Jabatan: ${report_content.header.job_title}` }),
          new Paragraph({
            text: `Unit Kerja: ${report_content.header.unit_name}`,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Ringkasan Pelaksanaan Tugas',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: report_content.executive_summary || '-' }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Rekap Aktivitas Harian',
            heading: HeadingLevel.HEADING_2,
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: activityRows,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Capaian Target Kinerja',
            heading: HeadingLevel.HEADING_2,
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: targetRows,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Kendala dan Tindak Lanjut',
            heading: HeadingLevel.HEADING_2,
          }),
          ...report_content.challenges_and_followup
            .split('\n')
            .map((line) => new Paragraph({ text: line })),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Penutup',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: report_content.closing_note || '-' }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = buildExportFileName(
    report_content.header.full_name,
    report.month,
    report.year,
    'docx'
  );
  triggerDownload(blob, fileName);
  return fileName;
}

export function exportMonthlyReportXLSX(report: MonthlyReport): string {
  const { report_content } = report;
  const wb = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['LAPORAN AKTIVITAS KERJA BULANAN'],
    ['Periode', report_content.header.period_label],
    ['Status', `${report.status} (Personal)`],
    ['Nama', report_content.header.full_name],
    ['NIP', report_content.header.nip],
    ['Jabatan', report_content.header.job_title],
    ['Unit Kerja', report_content.header.unit_name],
    [''],
    ['Ringkasan Eksekutif', report_content.executive_summary],
    ['Kendala dan Tindak Lanjut', report_content.challenges_and_followup],
    ['Penutup', report_content.closing_note],
  ]);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Ringkasan');

  const activitySheet = XLSX.utils.aoa_to_sheet([
    ['No', 'Tanggal', 'Kegiatan', 'Output / Hasil', 'Target Kinerja'],
    ...report_content.activity_rows.map((row, idx) => [
      idx + 1,
      formatTanggalIndonesia(row.activity_date),
      row.title,
      row.output_text,
      row.target_title,
    ]),
  ]);
  XLSX.utils.book_append_sheet(wb, activitySheet, 'Aktivitas Harian');

  const targetSheet = XLSX.utils.aoa_to_sheet([
    [
      'Target Kinerja',
      'Indikator',
      'Target',
      'Realisasi Tercatat',
      'Aktivitas Pendukung',
    ],
    ...report_content.target_rows.map((row) => [
      row.title,
      row.indicator,
      row.target_display,
      row.realization_display,
      row.supporting_count,
    ]),
  ]);
  XLSX.utils.book_append_sheet(wb, targetSheet, 'Capaian Target');

  const outputSheet = XLSX.utils.aoa_to_sheet([
    ['Satuan Output', 'Total Kuantitas', 'Jumlah Aktivitas'],
    ...report_content.output_recap.map((o) => [
      o.unit,
      o.total_quantity,
      o.activity_count,
    ]),
  ]);
  XLSX.utils.book_append_sheet(wb, outputSheet, 'Rekap Output');

  const fileName = buildExportFileName(
    report_content.header.full_name,
    report.month,
    report.year,
    'xlsx'
  );
  XLSX.writeFile(wb, fileName);
  return fileName;
}
