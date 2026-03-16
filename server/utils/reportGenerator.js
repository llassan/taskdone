const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const generateWeeklyPdf = async (order, clientName) => {
  const dir = path.join(__dirname, '..', 'uploads', `order-${order._id}`, 'reports');
  ensureDir(dir);
  const pdfPath = path.join(dir, `report-${Date.now()}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#059669').text('TaskDone', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('We apply to jobs for you.', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#111').text('Job Application Report', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor('#666').text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'center' });
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#059669');
    doc.moveDown();

    // Summary
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111').text('Summary');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor('#333');
    doc.text(`Client: ${clientName}`);
    doc.text(`Plan: ${order.plan.toUpperCase()}`);
    doc.text(`Total Applications: ${order.completedApplications} / ${order.totalApplications}`);
    doc.text(`Interview Calls Received: ${order.interviewCalls}`);
    doc.text(`Order Status: ${order.status}`);
    doc.moveDown();

    // Portal breakdown
    const portalCounts = {};
    const statusCounts = {};
    (order.applications || []).forEach(app => {
      portalCounts[app.portal] = (portalCounts[app.portal] || 0) + 1;
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111').text('Portal Breakdown');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor('#333');
    Object.entries(portalCounts).forEach(([portal, count]) => {
      doc.text(`  ${portal.charAt(0).toUpperCase() + portal.slice(1)}: ${count} applications`);
    });
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111').text('Application Status');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor('#333');
    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.text(`  ${status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${count}`);
    });
    doc.moveDown();

    // Applications table
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111').text('Applications');
    doc.moveDown(0.5);

    const apps = order.applications || [];
    if (apps.length > 0) {
      // Table header
      const startX = 40;
      let y = doc.y;
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
      doc.rect(startX, y, 515, 16).fill('#059669');
      doc.text('#', startX + 4, y + 4, { width: 20 });
      doc.text('Company', startX + 25, y + 4, { width: 110 });
      doc.text('Job Title', startX + 140, y + 4, { width: 130 });
      doc.text('Portal', startX + 275, y + 4, { width: 60 });
      doc.text('Location', startX + 340, y + 4, { width: 80 });
      doc.text('Status', startX + 425, y + 4, { width: 70 });
      doc.text('Date', startX + 460, y + 4, { width: 55 });
      y += 18;

      doc.font('Helvetica').fillColor('#333').fontSize(7);
      apps.forEach((app, i) => {
        if (y > 750) {
          doc.addPage();
          y = 40;
        }
        const bgColor = i % 2 === 0 ? '#f9fafb' : '#ffffff';
        doc.rect(startX, y, 515, 14).fill(bgColor);
        doc.fillColor('#333');
        doc.text(`${i + 1}`, startX + 4, y + 3, { width: 20 });
        doc.text(app.company || '-', startX + 25, y + 3, { width: 110 });
        doc.text(app.jobTitle || '-', startX + 140, y + 3, { width: 130 });
        doc.text(app.portal || '-', startX + 275, y + 3, { width: 60 });
        doc.text(app.location || '-', startX + 340, y + 3, { width: 80 });
        doc.text((app.status || '').replace(/_/g, ' '), startX + 425, y + 3, { width: 70 });
        doc.text(app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-', startX + 460, y + 3, { width: 55 });
        y += 14;
      });
    } else {
      doc.fontSize(9).font('Helvetica').fillColor('#999').text('No applications yet.');
    }

    // Interview guarantee
    doc.moveDown(2);
    if (order.plan === 'pro' || order.plan === 'max') {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#059669').text('Interview Guarantee');
      doc.moveDown(0.3);
      doc.fontSize(8).font('Helvetica').fillColor('#333');
      const target = order.plan === 'max' ? 10 : 5;
      doc.text(`Target: ${target} interview calls in 30 days`);
      doc.text(`Received so far: ${order.interviewCalls}`);
      doc.text(`Status: ${order.interviewCalls >= target ? 'GUARANTEE MET' : `${target - order.interviewCalls} more needed`}`);
    }

    // Footer
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#059669');
    doc.moveDown(0.3);
    doc.fontSize(7).font('Helvetica').fillColor('#999')
      .text('TaskDone — We apply to jobs for you. | taskdone.in', { align: 'center' });

    doc.end();
    stream.on('finish', () => resolve(`/uploads/order-${order._id}/reports/${path.basename(pdfPath)}`));
    stream.on('error', reject);
  });
};

const generateExcelReport = async (order, clientName) => {
  const dir = path.join(__dirname, '..', 'uploads', `order-${order._id}`, 'reports');
  ensureDir(dir);
  const excelPath = path.join(dir, `applications-${Date.now()}.xlsx`);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TaskDone';

  // Summary sheet
  const summary = workbook.addWorksheet('Summary');
  summary.columns = [{ header: 'Metric', key: 'metric', width: 30 }, { header: 'Value', key: 'value', width: 25 }];
  summary.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summary.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
  summary.addRow({ metric: 'Client', value: clientName });
  summary.addRow({ metric: 'Plan', value: order.plan.toUpperCase() });
  summary.addRow({ metric: 'Total Applications', value: `${order.completedApplications} / ${order.totalApplications}` });
  summary.addRow({ metric: 'Interview Calls', value: order.interviewCalls });
  summary.addRow({ metric: 'Order Status', value: order.status });
  summary.addRow({ metric: 'Report Date', value: new Date().toLocaleDateString('en-IN') });

  // Applications sheet
  const sheet = workbook.addWorksheet('Applications');
  sheet.columns = [
    { header: '#', key: 'num', width: 5 },
    { header: 'Company', key: 'company', width: 25 },
    { header: 'Job Title', key: 'jobTitle', width: 30 },
    { header: 'Portal', key: 'portal', width: 12 },
    { header: 'Location', key: 'location', width: 18 },
    { header: 'Salary', key: 'salary', width: 15 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Applied On', key: 'appliedAt', width: 14 },
    { header: 'Job URL', key: 'jobUrl', width: 40 },
    { header: 'Cover Letter', key: 'coverLetter', width: 12 },
    { header: 'Notes', key: 'notes', width: 25 },
  ];

  // Header style
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };

  (order.applications || []).forEach((app, i) => {
    sheet.addRow({
      num: i + 1,
      company: app.company,
      jobTitle: app.jobTitle,
      portal: app.portal,
      location: app.location,
      salary: app.salary,
      status: app.status.replace(/_/g, ' '),
      appliedAt: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : '',
      jobUrl: app.jobUrl,
      coverLetter: app.coverLetterUsed ? 'Yes' : 'No',
      notes: app.notes,
    });
  });

  // Alternate row colors
  for (let i = 2; i <= sheet.rowCount; i++) {
    if (i % 2 === 0) {
      sheet.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
    }
  }

  await workbook.xlsx.writeFile(excelPath);
  return `/uploads/order-${order._id}/reports/${path.basename(excelPath)}`;
};

module.exports = { generateWeeklyPdf, generateExcelReport };
