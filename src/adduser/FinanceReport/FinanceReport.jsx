import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './FinanceReport.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminFinancialDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    transactionType: '',
    startDate: '',
    endDate: '',
    searchGem: '',
    currencies: [],
  });

  const tableRef = useRef(null);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.transactionType) queryParams.append('transactionType', filters.transactionType);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.searchGem) queryParams.append('gemName', filters.searchGem);
      if (filters.currencies.length > 0) queryParams.append('currencies', filters.currencies.join(','));

      const response = await axios.get(`http://localhost:8000/api/finance?${queryParams.toString()}`);
      const fetchedTransactions = response.data.transactions;
      setTransactions(fetchedTransactions);

      const totalRevenue = fetchedTransactions
        .filter((t) => t.transactionType === 'sale' && t.status === 'completed')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const totalRefunds = fetchedTransactions
        .filter((t) => t.status === 'refunded' || (t.transactionType === 'refund' && t.status === 'completed'))
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const netRevenue = totalRevenue - totalRefunds;

      setSummary({
        totalTransactions: fetchedTransactions.length,
        totalAmount: totalRevenue,
        totalRefunds: totalRefunds,
        netRevenue: netRevenue,
      });
      setError('');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
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
      setTransactions((prev) =>
        prev.map((t) =>
          t._id === transactionId ? { ...t, status: newStatus } : t
        )
      );
      const totalRevenue = transactions
        .filter((t) => t.transactionType === 'sale' && (t._id === transactionId ? newStatus : t.status) === 'completed')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const totalRefunds = transactions
        .filter((t) =>
          (t._id === transactionId
            ? newStatus
            : t.status) === 'refunded' ||
          (t.transactionType === 'refund' && (t._id === transactionId ? newStatus : t.status) === 'completed')
        )
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const netRevenue = totalRevenue - totalRefunds;

      setSummary({
        totalTransactions: transactions.length,
        totalAmount: totalRevenue,
        totalRefunds: totalRefunds,
        netRevenue: totalRevenue - totalRefunds,
      });
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

  const handleCurrencyChange = (currency) => {
    setFilters((prev) => ({
      ...prev,
      currencies: prev.currencies.includes(currency)
        ? prev.currencies.filter((c) => c !== currency)
        : [...prev.currencies, currency],
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
    return `${currencySymbols[currency] || currency}${Number(amount).toFixed(2)}`;
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  const downloadTransactionPDF = (transaction) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(106, 90, 205);
    doc.text('GemSystem Transaction Details', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    const details = [
      ['Transaction ID', transaction._id],
      ['Date', new Date(transaction.createdAt).toLocaleDateString()],
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
      startY: 30,
      head: [['Property', 'Value']],
      body: details,
      theme: 'grid',
      headStyles: { fillColor: [106, 90, 205], textColor: [255, 255, 255] },
      styles: { cellPadding: 5 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' },
      );
    }

    doc.save(`Transaction_${transaction._id}.pdf`);
  };

  const downloadAllTransactionsPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(20);
    doc.setTextColor(106, 90, 205);
    doc.text('GemSystem Financial Report', 150, 20, { align: 'center' });

    const dateText = filters.startDate && filters.endDate
      ? `From ${filters.startDate} to ${filters.endDate}`
      : `As of ${new Date().toLocaleDateString()}`;
    doc.setFontSize(12);
    doc.text(dateText, 150, 30, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(74, 60, 178);
    doc.text('Financial Summary', 14, 40);

    const summaryData = [
      ['Total Transactions', summary.totalTransactions],
      ['Total Revenue', formatCurrency(summary.totalAmount, 'USD')],
      ['Total Refunds', formatCurrency(summary.totalRefunds, 'USD')],
      ['Net Revenue', formatCurrency(summary.netRevenue, 'USD')],
    ];

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [106, 90, 205], textColor: [255, 255, 255] },
      styles: { cellPadding: 5 },
      margin: { left: 14 },
      tableWidth: 100,
    });

    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(16);
    doc.setTextColor(74, 60, 178);
    doc.text('Transaction Details', 14, finalY + 15);

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
      startY: finalY + 20,
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
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        150,
        doc.internal.pageSize.height - 10,
        { align: 'center' },
      );
    }

    doc.save(`GemSystem_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="dashboard-container">
    
      <div className="dashboard-content">
        <nav className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">
                <i className="fas fa-gem"></i>
              </div>
              <div className="logo-text">GemSystem</div>
            </div>
          </div>
          <ul className="nav-items">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                <i className="fas fa-chart-line"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/users" className="nav-link">
                <i className="fas fa-users"></i>
                <span>User Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/gemdashboard" className="nav-link">
                <i className="fas fa-boxes"></i>
                <span>Inventory Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/financereport" className="nav-link active">
                <i className="fas fa-dollar-sign"></i>
                <span>Financial Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/cuttingview" className="nav-link">
                <i className="fas fa-cut"></i>
                <span>Gem Cutting</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/shippingdisplay" className="nav-link">
                <i className="fas fa-truck"></i>
                <span>Delivery Management</span>
              </Link>
            </li>
          </ul>
        </nav>
        <main className="main-content">
          <div className="admin-financial-dashboard">
            <h1>Financial Dashboard</h1>
            {error && <div className="error-message">{error}</div>}
            {loading ? (
              <div className="loading-container">
                <p>Loading transactions...</p>
              </div>
            ) : (
              <>
                <div className="summary-section">
                  <h2>Financial Summary</h2>
                  <div className="summary-cards">
                    <div className="summary-card">
                      <h3>Total Transactions</h3>
                      <p>{summary.totalTransactions || 0}</p>
                    </div>
                    <div className="summary-card">
                      <h3>Total Revenue</h3>
                      <p>{formatCurrency(summary.totalAmount || 0, 'USD')}</p>
                    </div>
                    <div className="summary-card">
                      <h3>Total Refunds</h3>
                      <p>{formatCurrency(summary.totalRefunds || 0, 'USD')}</p>
                    </div>
                    <div className="summary-card">
                      <h3>Net Revenue</h3>
                      <p>{formatCurrency(summary.netRevenue || 0, 'USD')}</p>
                    </div>
                  </div>
                </div>
                <div className="filters-section">
                  <h2>Filters</h2>
                  <div className="filter-controls">
                    <div className="filter-group search-group">
                      <label htmlFor="searchGem">Search by Gem:</label>
                      <div className="search-input-container">
                        <input
                          type="text"
                          id="searchGem"
                          name="searchGem"
                          value={filters.searchGem}
                          onChange={handleFilterChange}
                          placeholder="Enter gem name..."
                        />
                        {filters.searchGem ? (
                          <button className="clear-search-button" onClick={clearSearch}>
                            <i className="fas fa-times"></i>
                          </button>
                        ) : (
                          <i className="fas fa-search search-icon"></i>
                        )}
                      </div>
                    </div>
                    <div className="filter-group">
                      <label htmlFor="status">Status:</label>
                      <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    <div className="filter-group">
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
                    <div className="filter-group currency-filter">
                      <label>Currency:</label>
                      <div className="currency-options">
                        {['USD', 'EUR', 'GBP', 'JPY', 'AUD'].map((currency) => (
                          <div className="currency-option" key={currency}>
                            <input
                              type="checkbox"
                              id={`currency-${currency}`}
                              value={currency}
                              checked={filters.currencies.includes(currency)}
                              onChange={() => handleCurrencyChange(currency)}
                            />
                            <label htmlFor={`currency-${currency}`}>{currency}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="filter-group">
                      <label htmlFor="startDate">Start Date:</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="filter-group">
                      <label htmlFor="endDate">End Date:</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="transactions-section">
                  <h2>All Transactions</h2>
                  {transactions.length === 0 ? (
                    <p>No transactions found.</p>
                  ) : (
                    <div className="transactions-table-container" ref={tableRef}>
                      <table className="transactions-table">
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
                          {transactions.map((transaction) => (
                            <tr key={transaction._id} data-transaction-type={transaction.transactionType}>
                              <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                              <td>{transaction.transactionType}</td>
                              <td>{formatCurrency(transaction.amount, transaction.currency)}</td>
                              <td>{transaction.currency}</td>
                              <td>{transaction.paymentMethod}</td>
                              <td className={getStatusClass(transaction.status)}>{transaction.status}</td>
                              <td>{transaction.email}</td>
                              <td>{transaction.relatedGem?.name || 'N/A'}</td>
                              <td>{transaction.description}</td>
                              <td>
                                <button
                                  className="download-button"
                                  onClick={() => downloadTransactionPDF(transaction)}
                                  title="Download as PDF"
                                >
                                  <i className="fas fa-file-pdf"></i> PDF
                                </button>
                                <select
                                  className="status-update-select"
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      updateTransactionStatus(transaction._id, e.target.value);
                                      e.target.value = '';
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
                    <div className="download-all-container">
                      <button className="download-all-button" onClick={downloadAllTransactionsPDF}>
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