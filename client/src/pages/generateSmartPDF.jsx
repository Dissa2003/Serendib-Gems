import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import _ from 'lodash';
import logo from '../assets/serendib-gems-logo.jpeg';

// Enhanced PDF generation functions
const generateSmartPDF = {
  // PDF Header with logo and basic information
  header: (doc, title) => {
    doc.addImage(logo, 'JPEG', 10, 10, 40, 40);
    doc.setFontSize(20);
    doc.setTextColor(106, 90, 205);
    doc.text('Serendib Gems', 60, 30);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(title, 60, 40);
    doc.setLineWidth(0.5);
    doc.setDrawColor(106, 90, 205);
    doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10);
  },

  // PDF Footer with page numbers and generation timestamp
  footer: (doc, pageCount) => {
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Serendib Gems | www.serendibgems.com | Contact: info@serendibgems.com`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 20,
        { align: 'center' }
      );
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  },

  // Add data visualizations to PDF
  addCharts: (doc, transactions, y) => {
    // Add title for the charts section
    doc.setFontSize(14);
    doc.setTextColor(74, 60, 178);
    doc.text('Transaction Analysis', 14, y);

    // === Transaction by Type Pie Chart ===
    // This is a simple representation using SVG
    const typeGroups = _.groupBy(transactions, 'transactionType');
    const transactionTypes = Object.keys(typeGroups);
    const typeCounts = transactionTypes.map(type => typeGroups[type].length);
    const total = typeCounts.reduce((sum, count) => sum + count, 0);
    
    // Draw pie chart
    let currentAngle = 0;
    const centerX = 50;
    const centerY = y + 50;
    const radius = 30;
    const colors = ['#6A5ACD', '#9370DB', '#8A2BE2', '#483D8B'];
    
    // Draw pie slices
    transactionTypes.forEach((type, index) => {
      const portion = typeCounts[index] / total;
      const angle = portion * 2 * Math.PI;
      const endAngle = currentAngle + angle;
      
      const x1 = centerX + radius * Math.cos(currentAngle);
      const y1 = centerY + radius * Math.sin(currentAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      // Draw slice
      doc.setFillColor(colors[index % colors.length]);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      
      // Create pie slice path
      doc.moveTo(centerX, centerY);
      doc.lineTo(x1, y1);
      // Draw arc
      const sweep = angle > Math.PI ? 1 : 0;
      doc.arc(centerX, centerY, radius, currentAngle, endAngle, 'counterclockwise');
      doc.lineTo(centerX, centerY);
      doc.fill();
      
      currentAngle = endAngle;
    });
    
    // Draw legend
    let legendY = y + 20;
    transactionTypes.forEach((type, index) => {
      doc.setFillColor(colors[index % colors.length]);
      doc.rect(100, legendY, 10, 10, 'F');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`${type} (${Math.round((typeCounts[index] / total) * 100)}%)`, 115, legendY + 7);
      legendY += 15;
    });
    
    // === Monthly Transaction Volume Chart ===
    // Group transactions by month
    const monthGroups = _.groupBy(transactions, transaction => 
      new Date(transaction.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })
    );
    
    // Sort months chronologically
    const months = Object.keys(monthGroups).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      return new Date(`${monthA} 1, ${yearA}`) - new Date(`${monthB} 1, ${yearB}`);
    });
    
    // Take last 6 months if more than 6
    const recentMonths = months.slice(-6);
    const monthlyVolumes = recentMonths.map(month => monthGroups[month].length);
    
    // Draw bar chart
    const barChartX = 14;
    const barChartY = y + 100;
    const barWidth = 20;
    const barSpacing = 10;
    const maxBarHeight = 50;
    const maxVolume = Math.max(...monthlyVolumes);
    
    doc.setFontSize(12);
    doc.setTextColor(74, 60, 178);
    doc.text('Monthly Transaction Volume', barChartX, barChartY - 10);
    
    recentMonths.forEach((month, index) => {
      const barHeight = (monthlyVolumes[index] / maxVolume) * maxBarHeight;
      const barX = barChartX + index * (barWidth + barSpacing);
      const barY = barChartY + (maxBarHeight - barHeight);
      
      // Draw bar
      doc.setFillColor(106, 90, 205, 0.8);
      doc.rect(barX, barY, barWidth, barHeight, 'F');
      
      // Draw month label
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(month, barX + barWidth / 2, barChartY + maxBarHeight + 10, { align: 'center' });
      
      // Draw volume value
      doc.setFontSize(8);
      doc.text(monthlyVolumes[index].toString(), barX + barWidth / 2, barY - 2, { align: 'center' });
    });
    
    return barChartY + maxBarHeight + 25; // Return new Y position after charts
  },

  // Add summary statistics to PDF
  addSummaryStatistics: (doc, transactions, y) => {
    doc.setFontSize(14);
    doc.setTextColor(74, 60, 178);
    doc.text('Financial Summary', 14, y);
    
    // Calculate summary statistics
    const formatCurrency = (amount, currency) => {
      const currencySymbols = {
        USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$'
      };
      return `${currencySymbols[currency] || currency}${Number(amount).toFixed(2)}`;
    };
    
    const completedSales = transactions.filter(t => t.transactionType === 'sale' && t.status === 'completed');
    const refunds = transactions.filter(t => t.status === 'refunded' || (t.transactionType === 'refund' && t.status === 'completed'));
    
    const totalRevenue = completedSales.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalRefunds = refunds.reduce((sum, t) => sum + Number(t.amount), 0);
    const netRevenue = totalRevenue - totalRefunds;
    
    // Currency breakdown
    const currencyGroups = _.groupBy(completedSales, 'currency');
    const currencyBreakdown = Object.keys(currencyGroups).map(currency => ({
      currency,
      total: currencyGroups[currency].reduce((sum, t) => sum + Number(t.amount), 0)
    }));
    
    // Payment method breakdown
    const methodGroups = _.groupBy(completedSales, 'paymentMethod');
    const methodBreakdown = Object.keys(methodGroups).map(method => ({
      method,
      count: methodGroups[method].length,
      total: methodGroups[method].reduce((sum, t) => sum + Number(t.amount), 0)
    }));
    
    // Summary table
    const summaryData = [
      ['Total Transactions', transactions.length],
      ['Total Revenue', formatCurrency(totalRevenue, 'USD')],
      ['Total Refunds', formatCurrency(totalRefunds, 'USD')],
      ['Net Revenue', formatCurrency(netRevenue, 'USD')],
      ['Average Transaction Value', formatCurrency(completedSales.length ? totalRevenue / completedSales.length : 0, 'USD')],
      ['Refund Rate', `${refunds.length ? ((refunds.length / transactions.length) * 100).toFixed(1) : 0}%`]
    ];
    
    autoTable(doc, {
      startY: y + 5,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [106, 90, 205], textColor: [255, 255, 255] },
      styles: { cellPadding: 5 },
      margin: { left: 14, right: 14 },
      tableWidth: 100,
    });
    
    // Currency breakdown table
    const currencyY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(74, 60, 178);
    doc.text('Revenue by Currency', 14, currencyY);
    
    autoTable(doc, {
      startY: currencyY + 5,
      head: [['Currency', 'Total Revenue']],
      body: currencyBreakdown.map(c => [c.currency, formatCurrency(c.total, c.currency)]),
      theme: 'grid',
      headStyles: { fillColor: [106, 90, 205], textColor: [255, 255, 255] },
      styles: { cellPadding: 5 },
      margin: { left: 14, right: 14 },
      tableWidth: 100,
    });
    
    // Payment method breakdown table
    const methodY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(74, 60, 178);
    doc.text('Revenue by Payment Method', 130, currencyY);
    
    autoTable(doc, {
      startY: currencyY + 5,
      head: [['Payment Method', 'Count', 'Total Revenue']],
      body: methodBreakdown.map(m => [m.method, m.count, formatCurrency(m.total, 'USD')]),
      theme: 'grid',
      headStyles: { fillColor: [106, 90, 205], textColor: [255, 255, 255] },
      styles: { cellPadding: 5 },
      margin: { left: 130, right: 14 },
      tableWidth: 100,
    });
    
    return Math.max(doc.lastAutoTable.finalY, methodY) + 15;
  },
  
  // Add transaction timing analysis
  addTimingAnalysis: (doc, transactions, y) => {
    doc.setFontSize(14);
    doc.setTextColor(74, 60, 178);
    doc.text('Transaction Timing Analysis', 14, y);
    
    // Group transactions by day of week
    const weekdayGroups = _.groupBy(transactions, transaction => {
      const date = new Date(transaction.createdAt);
      return date.toLocaleString('default', { weekday: 'long' });
    });
    
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekdayCounts = weekdays.map(day => (weekdayGroups[day] || []).length);
    
    // Group transactions by hour
    const hourGroups = _.groupBy(transactions, transaction => {
      const date = new Date(transaction.createdAt);
      return date.getHours();
    });
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourCounts = hours.map(hour => (hourGroups[hour] || []).length);
    
    // Find peak hours (top 3)
    const peakHours = hours
      .map(hour => ({ hour, count: hourCounts[hour] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    // Find peak days
    const peakDays = weekdays
      .map(day => ({ day, count: (weekdayGroups[day] || []).length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    // Draw timing analysis table
    const timingData = [
      ['Busiest Day of Week', `${peakDays[0]?.day || 'N/A'} (${peakDays[0]?.count || 0} transactions)`],
      ['Second Busiest Day', `${peakDays[1]?.day || 'N/A'} (${peakDays[1]?.count || 0} transactions)`],
      ['Third Busiest Day', `${peakDays[2]?.day || 'N/A'} (${peakDays[2]?.count || 0} transactions)`],
      ['Peak Hour', `${peakHours[0]?.hour || 'N/A'}:00 (${peakHours[0]?.count || 0} transactions)`],
      ['Second Peak Hour', `${peakHours[1]?.hour || 'N/A'}:00 (${peakHours[1]?.count || 0} transactions)`],
      ['Third Peak Hour', `${peakHours[2]?.hour || 'N/A'}:00 (${peakHours[2]?.count || 0} transactions)`]
    ];
    
    autoTable(doc, {
      startY: y + 5,
      head: [['Timing Metric', 'Value']],
      body: timingData,
      theme: 'grid',
      headStyles: { fillColor: [106, 90, 205], textColor: [255, 255, 255] },
      styles: { cellPadding: 5 },
      margin: { left: 14, right: 14 },
      tableWidth: 100,
    });
    
    return doc.lastAutoTable.finalY + 15;
  },
  
  // Add top gems by revenue
  addTopGems: (doc, transactions, y) => {
    // Group transactions by gem
    const gemTransactions = transactions.filter(t => 
      t.relatedGem && t.relatedGem.name && t.transactionType === 'sale' && t.status === 'completed'
    );
    
    // Skip if no gem transactions
    if (gemTransactions.length === 0) {
      return y;
    }
    
    const gemGroups = _.groupBy(gemTransactions, t => t.relatedGem.name);
    
    // Calculate revenue for each gem
    const gemRevenue = Object.keys(gemGroups).map(gemName => {
      const total = gemGroups[gemName].reduce((sum, t) => sum + Number(t.amount), 0);
      const count = gemGroups[gemName].length;
      return { gemName, total, count, avg: total / count };
    }).sort((a, b) => b.total - a.total);
    
    // Only show top 10 gems
    const topGems = gemRevenue.slice(0, 10);
    
    // Draw table with top gems
    doc.setFontSize(14);
    doc.setTextColor(74, 60, 178);
    doc.text('Top Selling Gems', 14, y);
    
    const formatCurrency = (amount) => `$${Number(amount).toFixed(2)}`;
    
    autoTable(doc, {
      startY: y + 5,
      head: [['Gem Name', 'Sales Count', 'Total Revenue', 'Avg. Price']],
      body: topGems.map(gem => [
        gem.gemName, 
        gem.count, 
        formatCurrency(gem.total), 
        formatCurrency(gem.avg)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [106, 90, 205], textColor: [255, 255, 255] },
      styles: { cellPadding: 5 },
      margin: { left: 14, right: 14 },
    });
    
    return doc.lastAutoTable.finalY + 15;
  },

  // Generate single transaction PDF
  singleTransaction: (transaction) => {
    const doc = new jsPDF();
    generateSmartPDF.header(doc, 'Transaction Details');
    
    doc.setFontSize(16);
    doc.setTextColor(106, 90, 205);
    doc.text('Transaction Details', 105, 60, { align: 'center' });
    
    const formatCurrency = (amount, currency) => {
      const currencySymbols = {
        USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$'
      };
      return `${currencySymbols[currency] || currency}${Number(amount).toFixed(2)}`;
    };

    // Enhanced transaction details
    const details = [
      ['Transaction ID', transaction._id],
      ['Date', new Date(transaction.createdAt).toLocaleDateString()],
      ['Time', new Date(transaction.createdAt).toLocaleTimeString()],
      ['Type', transaction.transactionType],
      ['Amount', formatCurrency(transaction.amount, transaction.currency)],
      ['Currency', transaction.currency],
      ['Payment Method', transaction.paymentMethod],
      ['Status', transaction.status],
      ['Email', transaction.email],
      ['Gem', transaction.relatedGem?.name || 'N/A'],
      ['Description', transaction.description],
    ];

    autoTable(doc, {
      startY: 70,
      head: [['Property', 'Value']],
      body: details,
      theme: 'grid',
      headStyles: { fillColor: [106, 90, 205], textColor: [255, 255, 255] },
      styles: { cellPadding: 5 },
      margin: { left: 10, right: 10 },
    });
    
    // Add QR code for transaction tracking (simulated)
    const qrY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setTextColor(74, 60, 178);
    doc.text('Transaction Verification QR Code', 105, qrY, { align: 'center' });
    
    // Draw a simulated QR code square
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(80, qrY + 10, 50, 50, 3, 3, 'F');
    
    // Add some white boxes inside to simulate QR code patterns
    doc.setFillColor(255, 255, 255);
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (Math.random() > 0.5) {
          doc.rect(82 + i * 10, qrY + 12 + j * 10, 8, 8, 'F');
        }
      }
    }
    
    // Add some legal text
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This document serves as an official receipt for the transaction detailed above. For any inquiries or concerns', 105, qrY + 75, { align: 'center' });
    doc.text('regarding this transaction, please contact our customer support at support@serendibgems.com', 105, qrY + 82, { align: 'center' });
    
    const pageCount = doc.internal.getNumberOfPages();
    generateSmartPDF.footer(doc, pageCount);
    
    return doc;
  },

  // Generate PDF with all transactions
  allTransactions: (transactions, summary) => {
    const doc = new jsPDF('landscape');
    generateSmartPDF.header(doc, 'Financial Report - All Transactions');
    
    doc.setFontSize(16);
    doc.setTextColor(106, 90, 205);
    doc.text('Serendib Gems Financial Report - All Transactions', 150, 60, { align: 'center' });
    
    const dateText = `As of ${new Date().toLocaleDateString()}`;
    doc.setFontSize(12);
    doc.text(dateText, 150, 70, { align: 'center' });
    
    // Add summary statistics and charts
    let yPos = 80;
    yPos = generateSmartPDF.addSummaryStatistics(doc, transactions, yPos);
    yPos = generateSmartPDF.addCharts(doc, transactions, yPos);
    yPos = generateSmartPDF.addTimingAnalysis(doc, transactions, yPos);
    yPos = generateSmartPDF.addTopGems(doc, transactions, yPos);
    
    // Add transaction details
    doc.setFontSize(14);
    doc.setTextColor(74, 60, 178);
    doc.text('Transaction Details', 14, yPos);
    
    const formatCurrency = (amount, currency) => {
      const currencySymbols = {
        USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$'
      };
      return `${currencySymbols[currency] || currency}${Number(amount).toFixed(2)}`;
    };
    
    const tableData = transactions.map((transaction) => [
      new Date(transaction.createdAt).toLocaleDateString(),
      transaction.transactionType,
      formatCurrency(transaction.amount, transaction.currency),
      transaction.currency,
      transaction.paymentMethod,
      transaction.status,
      transaction.email,
      transaction.relatedGem?.name || 'N/A',
      transaction.description,
    ]);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Date', 'Type', 'Amount', 'Currency', 'Method', 'Status', 'Email', 'Gem', 'Description']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [106, 90, 205], textColor: [255, 255, 255] },
      styles: { cellPadding: 3, fontSize: 9 },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 40 },
        7: { cellWidth: 25 },
        8: { cellWidth: 50 },
      },
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    generateSmartPDF.footer(doc, pageCount);
    
    return doc;
  },
  
  // Generate PDF with filtered transactions
  filteredTransactions: (transactions, summary, filters) => {
    const doc = new jsPDF('landscape');
    generateSmartPDF.header(doc, 'Financial Report - Filtered Transactions');
    
    doc.setFontSize(16);
    doc.setTextColor(106, 90, 205);
    doc.text('Serendib Gems Financial Report - Filtered Transactions', 150, 60, { align: 'center' });
    
    // Add filter information
    const dateText = filters.startDate && filters.endDate
      ? `From ${filters.startDate} to ${filters.endDate}`
      : `As of ${new Date().toLocaleDateString()}`;
    doc.setFontSize(12);
    doc.text(dateText, 150, 70, { align: 'center' });
    
    // Add filter details
    const filterDetails = [];
    if (filters.status) filterDetails.push(`Status: ${filters.status}`);
    if (filters.transactionType) filterDetails.push(`Type: ${filters.transactionType}`);
    if (filters.searchGem) filterDetails.push(`Gem: ${filters.searchGem}`);
    
    if (filterDetails.length > 0) {
      doc.setFontSize(10);
      doc.text(`Filters applied: ${filterDetails.join(', ')}`, 150, 80, { align: 'center' });
    }
    
    // Add summary statistics and charts
    let yPos = 90;
    yPos = generateSmartPDF.addSummaryStatistics(doc, transactions, yPos);
    yPos = generateSmartPDF.addCharts(doc, transactions, yPos);
    
    // For filtered reports, add comparison with overall data if available
    if (summary.totalTransactions) {
      const filteredPercent = (transactions.length / summary.totalTransactions * 100).toFixed(1);
      doc.setFontSize(12);
      doc.setTextColor(74, 60, 178);
      doc.text(`This filtered set represents ${filteredPercent}% of all transactions.`, 14, yPos);
      yPos += 15;
    }
    
    // Add transaction details
    doc.setFontSize(14);
    doc.setTextColor(74, 60, 178);
    doc.text('Filtered Transaction Details', 14, yPos);
    
    const formatCurrency = (amount, currency) => {
      const currencySymbols = {
        USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$'
      };
      return `${currencySymbols[currency] || currency}${Number(amount).toFixed(2)}`;
    };
    
    const tableData = transactions.map((transaction) => [
      new Date(transaction.createdAt).toLocaleDateString(),
      transaction.transactionType,
      formatCurrency(transaction.amount, transaction.currency),
      transaction.currency,
      transaction.paymentMethod,
      transaction.status,
      transaction.email,
      transaction.relatedGem?.name || 'N/A',
      transaction.description,
    ]);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Date', 'Type', 'Amount', 'Currency', 'Method', 'Status', 'Email', 'Gem', 'Description']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [106, 90, 205], textColor: [255, 255, 255] },
      styles: { cellPadding: 3, fontSize: 9 },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 40 },
        7: { cellWidth: 25 },
        8: { cellWidth: 50 },
      },
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    generateSmartPDF.footer(doc, pageCount);
    
    return doc;
  }
};

export default generateSmartPDF;