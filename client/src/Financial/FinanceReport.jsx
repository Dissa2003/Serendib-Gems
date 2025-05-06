import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './css/financeReport.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/serendib-gems-logo.jpeg';

const AdminFinancialDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    transactionType: '',
    startDate: '',
    endDate: '',
    searchGem: '',
  });

  const tableRef = useRef(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/finance`);
      const fetchedTransactions = response.data.transactions || [];
      setTransactions(fetchedTransactions);
      setFilteredTransactions(fetchedTransactions);
      updateSummary(fetchedTransactions);
      setError('');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const updateSummary = (trans) => {
    const totalRevenue = trans
      .filter((t) => t.transactionType === 'sale' && t.status === 'completed')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const totalRefunds = trans
      .filter((t) => t.status === 'refunded' || (t.transactionType === 'refund' && t.status === 'completed'))
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const netRevenue = totalRevenue - totalRefunds;

    setSummary({
      totalTransactions: trans.length,
      totalAmount: totalRevenue,
      totalRefunds: totalRefunds,
      netRevenue: netRevenue,
    });
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    let filtered = [...transactions];

    if (filters.status) {
      filtered = filtered.filter((t) =>
        t.status && t.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.transactionType) {
      filtered = filtered.filter((t) =>
        t.transactionType && t.transactionType.toLowerCase() === filters.transactionType.toLowerCase()
      );
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      if (!isNaN(start)) {
        filtered = filtered.filter((t) => {
          const createdAt = new Date(t.createdAt);
          return !isNaN(createdAt) && createdAt >= start;
        });
      }
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      if (!isNaN(end)) {
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter((t) => {
          const createdAt = new Date(t.createdAt);
          return !isNaN(createdAt) && createdAt <= end;
        });
      }
    }

    if (filters.searchGem) {
      const searchTerm = filters.searchGem.toLowerCase().trim();
      filtered = filtered.filter((t) =>
        t.relatedGem?.name?.toLowerCase().includes(searchTerm)
      );
    }

    console.log('Filtered transactions:', filtered);
    setFilteredTransactions(filtered);
    updateSummary(filtered);
  };

  const updateTransactionStatus = async (transactionId, newStatus) => {
    if (!window.confirm(`Are you sure you want to update the transaction status to "${newStatus}"?`)) {
      return;
    }

    try {
      await axios.patch(
        `http://localhost:8000/api/finance/${transactionId}`,
        { status: newStatus }
      );
      const updatedTransactions = transactions.map((t) =>
        t._id === transactionId ? { ...t, status: newStatus } : t
      );
      setTransactions(updatedTransactions);
      setFilteredTransactions((prev) =>
        prev.map((t) => (t._id === transactionId ? { ...t, status: newStatus } : t))
      );
      updateSummary(updatedTransactions);
      setError('');
    } catch (err) {
      console.error('Error updating transaction status:', err);
      setError(err.response?.data?.message || 'Failed to update transaction status');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearSearch = () => {
    setFilters((prev) => ({
      ...prev,
      searchGem: '',
    }));
  };

  const formatCurrency = (amount, currency) => {
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$',
    };
    return `${currencySymbols[currency] || currency}${Number(amount || 0).toFixed(2)}`;
  };

  const getStatusClass = (status) => {
    return `fin-dash-status-${status?.toLowerCase() || ''}`;
  };

  const generatePDFHeader = (doc, title) => {
    doc.addImage(logo, 'JPEG', 15, 10, 35, 35);
    doc.setFontSize(22);
    doc.setTextColor(94, 96, 206);
    doc.text('Serendib Gems', 60, 25);
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(title, 60, 35);
    doc.setLineWidth(0.5);
    doc.setDrawColor(94, 96, 206);
    doc.rect(10, 10, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 20);
  };

  const generatePDFFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Serendib Gems | www.serendibgems.com | Contact: info@serendibgems.com`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 25,
        { align: 'center' }
      );
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 15,
        { align: 'center' }
      );
    }
  };

  const downloadTransactionPDF = (transaction) => {
    const doc = new jsPDF();
    generatePDFHeader(doc, 'Transaction Report');

    doc.setFontSize(18);
    doc.setTextColor(94, 96, 206);
    doc.text('Transaction Details', doc.internal.pageSize.width / 2, 55, { align: 'center' });

    const details = [
      ['Transaction ID', transaction._id || 'N/A'],
      ['Date', transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'],
      ['Type', transaction.transactionType || 'N/A'],
      ['Amount', formatCurrency(transaction.amount, transaction.currency)],
      ['Currency', transaction.currency || 'N/A'],
      ['Payment Method', transaction.paymentMethod || 'N/A'],
      ['Status', transaction.status || 'N/A'],
      ['Email', transaction.email || 'N/A'],
      ['Gem', transaction.relatedGem?.name || 'N/A'],
      ['Description', transaction.description || 'N/A'],
    ];

    autoTable(doc, {
      startY: 65,
      head: [['Property', 'Value']],
      body: details,
      theme: 'grid',
      headStyles: { fillColor: [94, 96, 206], textColor: [255, 255, 255], fontSize: 12 },
      styles: { cellPadding: 6, fontSize: 8, textColor: [50, 50, 50] },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 100 },
      },
    });

    generatePDFFooter(doc);
    doc.save(`Serendib_Transaction_${transaction._id || 'unknown'}.pdf`);
  };

  const generateTransactionsPDF = (transactions, title, dateText, isFiltered = false) => {
    const doc = new jsPDF('landscape');
    generatePDFHeader(doc, 'Financial Report');

    doc.setFontSize(18);
    doc.setTextColor(94, 96, 206);
    doc.text(title, doc.internal.pageSize.width / 2, 55, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(dateText, doc.internal.pageSize.width / 2, 65, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(74, 60, 178);
    doc.text('Financial Summary', 15, 80);

    const summaryData = [
      ['Total Transactions', summary.totalTransactions || 0],
      ['Total Revenue', formatCurrency(summary.totalAmount || 0, 'USD')],
      ['Total Refunds', formatCurrency(summary.totalRefunds || 0, 'USD')],
      ['Net Revenue', formatCurrency(summary.netRevenue || 0, 'USD')],
    ];

    autoTable(doc, {
      startY: 85,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [94, 96, 206], textColor: [255, 255, 255], fontSize: 12 },
      styles: { cellPadding: 6, fontSize: 10 },
      margin: { left: 15, right: 15 },
      tableWidth: 100,
    });

    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(16);
    doc.setTextColor(74, 60, 178);
    doc.text(isFiltered ? 'Filtered Transaction Details' : 'Transaction Details', 15, finalY + 20);

    const tableData = transactions.map((transaction) => [
      transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A',
      transaction.transactionType || 'N/A',
      formatCurrency(transaction.amount, transaction.currency),
      transaction.currency || 'N/A',
      transaction.paymentMethod || 'N/A',
      transaction.status || 'N/A',
      transaction.email || 'N/A',
      transaction.relatedGem?.name || 'N/A',
      transaction.description || 'N/A',
    ]);

    autoTable(doc, {
      startY: finalY + 25,
      head: [['Date', 'Type', 'Amount', 'Currency', 'Method', 'Status', 'Email', 'Gem', 'Description']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [94, 96, 206], textColor: [255, 255, 255], fontSize: 11 },
      styles: { cellPadding: 5, fontSize: 9, overflow: 'linebreak', textColor: [50, 50, 50] },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25 },
        6: { cellWidth: 50 },
        7: { cellWidth: 30 },
        8: { cellWidth: 40 },
      },
    });

    generatePDFFooter(doc);
    doc.save(`Serendib_Financial_Report_${isFiltered ? 'Filtered' : 'All'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const downloadAllTransactionsPDF = () => {
    generateTransactionsPDF(
      transactions,
      'Serendib Gems Financial Report - All Transactions',
      `As of ${new Date().toLocaleDateString()}`
    );
  };

  const downloadFilteredTransactionsPDF = () => {
    const dateText = filters.startDate && filters.endDate
      ? `From ${filters.startDate} to ${filters.endDate}`
      : `As of ${new Date().toLocaleDateString()}`;
    generateTransactionsPDF(
      filteredTransactions,
      'Serendib Gems Financial Report - Filtered Transactions',
      dateText,
      true
    );
  };

  return (
    <div className="fin-dash-container">
      <div className="fin-dash-content">
        <nav className="fin-dash-sidebar">
          <div className="fin-dash-sidebar-header">
            <div className="fin-dash-logo">
              <img src={logo} alt="Serendib Gems" className="fin-dash-logo-image" />
              <div className="fin-dash-logo-text">Serendib Gems</div>
            </div>
          </div>
          <ul className="fin-dash-nav-items">
            <li className="fin-dash-nav-item">
              <Link to="/dashboard" className="fin-dash-nav-link">
                <i className="fas fa-chart-line"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="fin-dash-nav-item">
              <Link to="/users" className="fin-dash-nav-link">
                <i className="fas fa-users"></i>
                <span>User Management</span>
              </Link>
            </li>
            <li className="fin-dash-nav-item">
              <Link to="/gemdashboard" className="fin-dash-nav-link">
                <i className="fas fa-boxes"></i>
                <span>Inventory Management</span>
              </Link>
            </li>
            <li className="fin-dash-nav-item">
              <Link to="/financereport" className="fin-dash-nav-link active">
                <i className="fas fa-dollar-sign"></i>
                <span>Financial Management</span>
              </Link>
            </li>
            <li className="fin-dash-nav-item">
              <Link to="/cuttingview" className="fin-dash-nav-link">
                <i className="fas fa-cut"></i>
                <span>Gem Cutting</span>
              </Link>
            </li>
            <li className="fin-dash-nav-item">
              <Link to="/shippingdisplay" className="fin-dash-nav-link">
                <i className="fas fa-truck"></i>
                <span>Delivery Management</span>
              </Link>
            </li>
          </ul>
        </nav>
        <main className="fin-dash-main-content">
          <div className="fin-dash-admin-financial">
            <div className="fin-dash-header-section">
              <h1>Serendib Gems Financial Dashboard</h1>
              <Link to="/findash">
                <button className="fin-dash-btn fin-dash-btn-primary">
                  Finance Overview
                </button>
              </Link>
            </div>
            {error && <div className="fin-dash-error-message">{error}</div>}
            {loading ? (
              <div className="fin-dash-loading-container">
                <p>Loading transactions...</p>
              </div>
            ) : (
              <>
                <div className="fin-dash-summary-section">
                  <h2>Financial Summary</h2>
                  <div className="fin-dash-summary-cards">
                    <div className="fin-dash-summary-card">
                      <h3>Total Transactions</h3>
                      <p>{summary.totalTransactions || 0}</p>
                    </div>
                    <div className="fin-dash-summary-card">
                      <h3>Total Revenue</h3>
                      <p>{formatCurrency(summary.totalAmount || 0, 'USD')}</p>
                    </div>
                    <div className="fin-dash-summary-card">
                      <h3>Total Refunds</h3>
                      <p>{formatCurrency(summary.totalRefunds || 0, 'USD')}</p>
                    </div>
                    <div className="fin-dash-summary-card">
                      <h3>Net Revenue</h3>
                      <p>{formatCurrency(summary.netRevenue || 0, 'USD')}</p>
                    </div>
                  </div>
                </div>
                <div className="fin-dash-filters-section">
                  <h2>Filters</h2>
                  <div className="fin-dash-filter-controls">
                    <div className="fin-dash-filter-group fin-dash-search-group">
                      <label htmlFor="searchGem">Search by Gem:</label>
                      <div className="fin-dash-search-input-container">
                        <input
                          type="text"
                          id="searchGem"
                          name="searchGem"
                          value={filters.searchGem}
                          onChange={handleFilterChange}
                          placeholder="Enter gem name..."
                        />
                        {filters.searchGem ? (
                          <button className="fin-dash-clear-search-button" onClick={clearSearch}>
                            <i className="fas fa-times"></i>
                          </button>
                        ) : (
                          <i className="fas fa-search fin-dash-search-icon"></i>
                        )}
                      </div>
                    </div>
                    <div className="fin-dash-filter-group">
                      <label htmlFor="status">Status:</label>
                      <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    <div className="fin-dash-filter-group">
                      <label htmlFor="transactionType">Type:</label>
                      <select
                        id="transactionType"
                        name="transactionType"
                        value={filters.transactionType}
                        onChange={handleFilterChange}
                      >
                        <option value="">All</option>
                        <option value="sale">Sale</option>
                        <option value="refund">Refund</option>
                      </select>
                    </div>
                    <div className="fin-dash-filter-group">
                      <label htmlFor="startDate">Start Date:</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="fin-dash-filter-group">
                      <label htmlFor="endDate">End Date:</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="fin-dash-filter-group">
                      <button className="fin-dash-download-filtered-button" onClick={downloadFilteredTransactionsPDF}>
                        <i className="fas fa-file-pdf"></i> Download Filtered PDF
                      </button>
                    </div>
                  </div>
                </div>
                <div className="fin-dash-transactions-section">
                  <h2>All Transactions</h2>
                  {filteredTransactions.length === 0 ? (
                    <p>No transactions found.</p>
                  ) : (
                    <div className="fin-dash-transactions-table-container" ref={tableRef}>
                      <table className="fin-dash-transactions-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Email</th>
                            <th>Gem</th>
                            <th>Description</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map((transaction) => (
                            <tr key={transaction._id} data-transaction-type={transaction.transactionType}>
                              <td>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}</td>
                              <td>{transaction.transactionType || 'N/A'}</td>
                              <td>{formatCurrency(transaction.amount, transaction.currency)}</td>
                              <td>{transaction.currency || 'N/A'}</td>
                              <td>{transaction.paymentMethod || 'N/A'}</td>
                              <td className={getStatusClass(transaction.status)}>{transaction.status || 'N/A'}</td>
                              <td>{transaction.email || 'N/A'}</td>
                              <td>{transaction.relatedGem?.name || 'N/A'}</td>
                              <td>{transaction.description || 'N/A'}</td>
                              <td className="fin-dash-actions-cell">
                                <button
                                  className="fin-dash-download-button"
                                  onClick={() => downloadTransactionPDF(transaction)}
                                  title="Download as PDF"
                                >
                                  <i className="fas fa-file-pdf"></i> PDF
                                </button>
                                <select
                                  className="fin-dash-status-update-select"
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      updateTransactionStatus(transaction._id, e.target.value);
                                    }
                                  }}
                                  title="Update Status"
                                >
                                  <option value="" disabled>
                                    Update Status
                                  </option>
                                  <option value="pending">Pending</option>
                                  <option value="completed">Completed</option>
                                  <option value="failed">Failed</option>
                                  <option value="refunded">Refunded</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {transactions.length > 0 && (
                    <div className="fin-dash-download-all-container">
                      <button className="fin-dash-download-all-button" onClick={downloadAllTransactionsPDF}>
                        <i className="fas fa-file-pdf"></i> Download All Transactions as PDF
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminFinancialDashboard;