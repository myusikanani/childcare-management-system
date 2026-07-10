// File Path: src/utils/exportUtils.js
// Utility functions for PDF invoice generation and CSV export

const jsPDF = require('jspdf');

// ── Helper: Format date ──────────────────────────────────────
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Helper: Format currency ──────────────────────────────────
const formatCurrency = (amount) => {
  return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ── Helper: Generate invoice number ──────────────────────────
const generateInvoiceNumber = (booking) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const id = (booking?._id?.slice(-6) || Math.random().toString(36).substr(2, 6)).toUpperCase();
  return `INV-${year}${month}-${id}`;
};

// ── PDF Invoice Generation ────────────────────────────────────
export const generateInvoicePDF = (booking, user, role) => {
  const doc = new jsPDF();
  const invoiceNo = generateInvoiceNumber(booking);
  const invoiceDate = formatDate(new Date());
  
  // Colors
  const primaryColor = [99, 102, 241]; // Purple
  const darkColor = [30, 41, 59];
  const grayColor = [100, 116, 139];
  const lightGray = [241, 245, 249];

  // Header - Invoice title
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 220, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 20, 25);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('ChidCare Childcare Services', 20, 35);
  
  // Invoice details (right side)
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoiceNo}`, 140, 15);
  doc.text(`Date: ${invoiceDate}`, 140, 23);
  doc.text(`Status: ${(booking?.paymentStatus || 'unpaid').toUpperCase()}`, 140, 31);
  
  // From/To Section
  let y = 55;
  
  // Platform info
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', 20, y);
  doc.text('TO', 120, y);
  
  y += 8;
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ChidCare Platform', 20, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text('support@chidcare.com', 20, y);
  doc.text('www.chidcare.com', 20, y + 5);
  
  // To section - Different based on role
  y = 63;
  if (role === 'parent') {
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.name || 'Parent', 120, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text(user?.email || '', 120, y);
    if (user?.phone) {
      y += 5;
      doc.text(user?.phone || '', 120, y);
    }
  } else if (role === 'caretaker') {
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(booking?.parentName || 'Parent', 120, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text(booking?.parentEmail || '', 120, y);
  } else {
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Admin', 120, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('System Generated', 120, y);
  }
  
  // Booking Details Section
  y = 95;
  doc.setFillColor(...lightGray);
  doc.rect(15, y - 5, 180, 10, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING DETAILS', 20, y + 2);
  
  y += 15;
  
  // Table header
  doc.setFillColor(...primaryColor);
  doc.rect(15, y, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, y + 5.5);
  doc.text('Date', 100, y + 5.5);
  doc.text('Duration', 130, y + 5.5);
  doc.text('Amount', 175, y + 5.5);
  
  y += 12;
  
  // Booking row
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const serviceDesc = role === 'parent' 
    ? `Childcare Service - ${booking?.caretakerName || 'Caretaker'}`
    : `Childcare Session - ${booking?.parentName || 'Parent'}`;
  
  doc.text(serviceDesc, 20, y);
  doc.text(formatDate(booking?.date), 100, y);
  doc.text(`${booking?.duration || 0} hrs`, 130, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(booking?.totalAmount), 175, y);
  
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text(`Time: ${booking?.startTime || '--:--'} to ${booking?.endTime || '--:--'}`, 20, y);
  y += 5;
  doc.text(`Children: ${booking?.childrenCount || 1}${booking?.childrenAges?.length ? ' (Ages: ' + booking.childrenAges.join(', ') + ')' : ''}`, 20, y);
  
  // Payment Summary
  y += 20;
  
  // Line
  doc.setDrawColor(...grayColor);
  doc.line(120, y, 195, y);
  
  y += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text('Subtotal:', 140, y);
  doc.setTextColor(...darkColor);
  doc.text(formatCurrency(booking?.totalAmount), 175, y);
  
  y += 7;
  doc.setTextColor(...grayColor);
  doc.text('Platform Fee (0%):', 140, y);
  doc.setTextColor(...darkColor);
  doc.text(formatCurrency(0), 175, y);
  
  y += 10;
  doc.setFillColor(...primaryColor);
  doc.rect(130, y - 5, 65, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 135, y + 3);
  doc.text(formatCurrency(booking?.totalAmount), 175, y + 3);
  
  // Payment Info
  y += 25;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INFORMATION', 20, y);
  
  y += 10;
  doc.setTextColor(...darkColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Status: ${(booking?.paymentStatus || 'unpaid').toUpperCase()}`, 20, y);
  y += 6;
  doc.text(`Payment Method: ${booking?.paymentMethod || 'Not specified'}`, 20, y);
  y += 6;
  doc.text(`Transaction ID: ${booking?.transactionId || 'N/A'}`, 20, y);
  if (booking?.paidAt) {
    y += 6;
    doc.text(`Paid On: ${formatDate(booking.paidAt)}`, 20, y);
  }
  
  // Footer
  y = 260;
  doc.setFillColor(...lightGray);
  doc.rect(0, y - 10, 220, 40, 'F');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for using ChidCare!', 105, y, { align: 'center' });
  doc.text('For any queries, contact support@chidcare.com', 105, y + 6, { align: 'center' });
  doc.text('This is a computer-generated invoice. No signature required.', 105, y + 12, { align: 'center' });
  doc.text(`Invoice ID: ${invoiceNo}`, 105, y + 18, { align: 'center' });
  
  // Save
  doc.save(`Invoice_${invoiceNo}.pdf`);
  
  return invoiceNo;
};

// ── CSV Export ────────────────────────────────────────────────
export const exportToCSV = (transactions, filename = 'transactions') => {
  if (!transactions || transactions.length === 0) {
    alert('No data to export');
    return;
  }
  
  // Define CSV headers
  const headers = [
    'Transaction ID',
    'Date',
    'Description',
    'Parent',
    'Caretaker',
    'Duration (hrs)',
    'Amount (₹)',
    'Payment Status',
    'Payment Method',
    'Booking Status',
    'Children Count',
    'Notes'
  ];
  
  // Helper to escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  // Build CSV rows
  const rows = transactions.map((tx) => {
    const booking = tx.booking || tx;
    return [
      escapeCSV(booking.transactionId || booking._id?.slice(-8).toUpperCase() || tx.id),
      escapeCSV(booking.date || tx.date),
      escapeCSV(booking.caretakerName ? `Childcare - ${booking.caretakerName}` : tx.description || 'Service'),
      escapeCSV(booking.parentName || tx.name || ''),
      escapeCSV(booking.caretakerName || ''),
      escapeCSV(booking.duration || tx.duration || 0),
      escapeCSV(booking.totalAmount || tx.amount || 0),
      escapeCSV((booking.paymentStatus || tx.status || '').toUpperCase()),
      escapeCSV(booking.paymentMethod || tx.method || 'N/A'),
      escapeCSV((booking.status || '').toUpperCase()),
      escapeCSV(booking.childrenCount || tx.childrenCount || 1),
      escapeCSV(booking.notes || tx.notes || '')
    ].join(',');
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// ── Bulk PDF Export (for multiple bookings) ──────────────────
export const generateBulkInvoices = (bookings, user, role) => {
  bookings.forEach((booking, index) => {
    setTimeout(() => {
      generateInvoicePDF(booking, user, role);
    }, index * 500); // Delay to prevent browser blocking
  });
};
