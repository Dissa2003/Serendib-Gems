import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import './css/dashboard.css';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    totalRefunds: 0,
    netRevenue: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const chartsRef = useRef(null);
  const summaryRef = useRef(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/finance', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const fetchedTransactions = response.data.transactions || [];
      setTransactions(fetchedTransactions);

      const totalRevenue = fetchedTransactions.reduce(
        (sum, transaction) =>
          transaction.transactionType === 'sale' ? sum + Number(transaction.amount) : sum,
        0
      );
      const totalRefunds = fetchedTransactions
        .filter((t) => t.transactionType === 'refund')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const netRevenue = totalRevenue - totalRefunds;

      setSummary({
        totalTransactions: fetchedTransactions.length,
        totalAmount: totalRevenue,
        totalRefunds: totalRefunds,
        netRevenue: netRevenue,
      });

      const monthlyStats = processMonthlyData(fetchedTransactions);
      setMonthlyData(monthlyStats);
      setError('');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (transactions) => {
    const monthlyMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((month) => {
      monthlyMap[month] = { month, revenue: 0, expenses: 0, transactions: 0 };
    });

    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const month = months[date.getMonth()];
      if (transaction.transactionType === 'sale') {
        monthlyMap[month].revenue += Number(transaction.amount);
        monthlyMap[month].transactions += 1;
      } else if (transaction.transactionType === 'refund') {
        monthlyMap[month].expenses += Number(transaction.amount);
      }
    });

    return Object.values(monthlyMap);
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'dash-status-completed';
      case 'pending':
        return 'dash-status-pending';
      case 'failed':
        return 'dash-status-failed';
      case 'refunded':
        return 'dash-status-refunded';
      default:
        return '';
    }
  };

  const downloadAnalysisPDF = async () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      console.log('jsPDF:', jsPDF);
      console.log('autoTable:', autoTable);
      console.log('doc.autoTable:', doc.autoTable);

      const pageWidth = doc.internal.pageSize.width;
      const margin = 10;
      let yOffset = 10;

      doc.setFontSize(18);
      doc.setTextColor(94, 96, 206);
      doc.text('Serendib Gems Dashboard Analysis', pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 10;

      if (summaryRef.current) {
        const summaryCanvas = await html2canvas(summaryRef.current, { scale: 2 });
        const summaryImg = summaryCanvas.toDataURL('image/png');
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (summaryCanvas.height * imgWidth) / summaryCanvas.width;
        doc.addImage(summaryImg, 'PNG', margin, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10;
      }

      if (chartsRef.current) {
        const chartsCanvas = await html2canvas(chartsRef.current, { scale: 2 });
        const chartsImg = chartsCanvas.toDataURL('image/png');
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (chartsCanvas.height * imgWidth) / chartsCanvas.width;

        if (yOffset + imgHeight > doc.internal.pageSize.height - margin) {
          doc.addPage();
          yOffset = margin;
        }

        doc.addImage(chartsImg, 'PNG', margin, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10;
      }

      doc.setFontSize(14);
      doc.text('Recent Transactions', margin, yOffset);
      yOffset += 10;

      const tableData = transactions.slice(0, 5).map((txn) => [
        new Date(txn.createdAt).toLocaleDateString(),
        formatCurrency(txn.amount),
        txn.transactionType,
        txn.paymentMethod,
        txn.status,
        txn.relatedGem?.name || 'N/A',
      ]);

      autoTable(doc, {
        startY: yOffset,
        head: [['Date', 'Amount', 'Type', 'Method', 'Status', 'Gem']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [94, 96, 206], textColor: [255, 255, 255], fontSize: 10 },
        styles: { cellPadding: 3, fontSize: 8, textColor: [50, 50, 50] },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
        },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save('Serendib_Dashboard_Analysis.pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="dash-container">
      <nav className="dash-sidebar">
        <div className="dash-sidebar-header">
          <div className="dash-logo">
            <div className="dash-logo-icon">
              <i className="fas fa-gem"></i>
            </div>
            <div className="dash-logo-text">Serendib Gems</div>
          </div>
        </div>
        <ul className="dash-nav-items">
          <li className="dash-nav-item">
            <Link to="/dashboard" className="dash-nav-link">
              <i className="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="dash-nav-item">
            <Link to="/users" className="dash-nav-link">
              <i className="fas fa-users"></i>
              <span>User Management</span>
            </Link>
          </li>
          <li className="dash-nav-item">
            <Link to="/gemdashboard" className="dash-nav-link">
              <i className="fas fa-boxes"></i>
              <span>Inventory Management</span>
            </Link>
          </li>
          <li className="dash-nav-item">
            <Link to="/financereport" className="dash-nav-link active">
              <i className="fas fa-dollar-sign"></i>
              <span>Financial Management</span>
            </Link>
          </li>
          <li className="dash-nav-item">
            <Link to="/cuttingview" className="dash-nav-link">
              <i className="fas fa-cut"></i>
              <span>Gem Cutting</span>
            </Link>
          </li>
          <li className="dash-nav-item">
            <Link to="/shippingdisplay" className="dash-nav-link">
              <i className="fas fa-truck"></i>
              <span>Delivery Management</span>
            </Link>
          </li>
        </ul>
      </nav>
      <main className="dash-main-content">
        <div className="dash-content-wrapper">
          {loading ? (
            <div className="dash-loading-container">
              <div className="dash-loading-spinner"></div>
            </div>
          ) : (
            <>
              {error && <div className="dash-error-message">{error}</div>}
              <div ref={summaryRef} className="dash-summary-section">
                <Card className="dash-summary-card dash-card-revenue">
                  <CardContent className="dash-card-content">
                    <h2 className="dash-card-title">Total Revenue</h2>
                    <p className="dash-card-value">{formatCurrency(summary.totalAmount)}</p>
                    <p className="dash-card-subtitle">{summary.totalTransactions} transactions</p>
                  </CardContent>
                </Card>
                <Card className="dash-summary-card dash-card-refunds">
                  <CardContent className="dash-card-content">
                    <h2 className="dash-card-title">Total Refunds</h2>
                    <p className="dash-card-value">{formatCurrency(summary.totalRefunds)}</p>
                    <p className="dash-card-subtitle">
                      {transactions.filter((t) => t.transactionType === 'refund').length} refund transactions
                    </p>
                  </CardContent>
                </Card>
                <Card className="dash-summary-card dash-card-net">
                  <CardContent className="dash-card-content">
                    <h2 className="dash-card-title">Net Revenue</h2>
                    <p className="dash-card-value">{formatCurrency(summary.netRevenue)}</p>
                    <p className="dash-card-subtitle">After all refunds</p>
                  </CardContent>
                </Card>
              </div>
              <div ref={chartsRef} className="dash-charts-section">
                <div className="dash-chart-container">
                  <h2 className="dash-chart-title">Revenue & Refunds Trend</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value) => [`$${value.toFixed(2)}`, '']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#4CAF50"
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        name="Refunds"
                        stroke="#F44336"
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="dash-chart-container">
                  <h2 className="dash-chart-title">Monthly Transactions</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar dataKey="transactions" name="Transactions" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="dash-transactions-section">
                <h2 className="dash-transactions-title">Recent Transactions</h2>
                <div className="dash-table-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Gem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 5).map((txn) => (
                        <TableRow key={txn._id} className="dash-table-row">
                          <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{formatCurrency(txn.amount)}</TableCell>
                          <TableCell>{txn.transactionType}</TableCell>
                          <TableCell>{txn.paymentMethod}</TableCell>
                          <TableCell className={getStatusColor(txn.status)}>{txn.status}</TableCell>
                          <TableCell>{txn.relatedGem?.name || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="dash-download-container">
                  <button className="dash-download-button" onClick={downloadAnalysisPDF} aria-label="Download dashboard analysis as PDF">
                    <i className="fas fa-file-pdf"></i> Download Analysis as PDF
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;