import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ship.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/serendib-gems-logo.jpeg';

const ShippingDisplay = () => {
  const [shippings, setShippings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [selectedTracking, setSelectedTracking] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('_id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Fetch all shipping orders
  useEffect(() => {
    const fetchShippings = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/shipping/');
        setShippings(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch shipping orders');
        setLoading(false);
      }
    };
    fetchShippings();
  }, []);

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle status update
  const handleStatusUpdate = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:8000/api/shipping/${id}/status`, {
        status: selectedStatus[id],
      });
      setShippings(shippings.map((ship) => (ship._id === id ? response.data : ship)));
      showNotification('Status updated successfully', 'success');
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  // Handle tracking number update
  const handleTrackingUpdate = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:8000/api/shipping/${id}/tracking`, {
        trackingNumber: selectedTracking[id],
      });
      setShippings(shippings.map((ship) => (ship._id === id ? response.data : ship)));
      showNotification('Tracking number updated successfully', 'success');
    } catch (err) {
      showNotification('Failed to update tracking number', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shipping order?')) {
      try {
        await axios.delete(`http://localhost:8000/api/shipping/${id}`);
        setShippings(shippings.filter((ship) => ship._id !== id));
        showNotification('Shipping order deleted successfully', 'success');
      } catch (err) {
        showNotification('Failed to delete shipping order', 'error');
      }
    }
  };

  // Get formatted date
  const getFormattedDate = (dateString) => {
    const date = new Date(dateString || Date.now());
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Generate PDF for a single shipping order
  const generatePDF = (shipping) => {
    const doc = new jsPDF();
    
    // Add border
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287, 'S'); // A4 size: 210x297 mm, 5mm margin

    // Add logo
    doc.addImage(logo, 'JPEG', 20, 10, 50, 20);

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`Shipping Order #${shipping._id.slice(-8)}`, 80, 25);

    // Add status
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: ${shipping.status.toUpperCase()}`, 80, 35);

    // Add order details
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer: ${shipping.customerEmail}`, 20, 60);
    doc.text(`Product: ${shipping.orderItem?.name || 'N/A'}`, 20, 70);
    doc.text(`Quantity: ${shipping.quantity}`, 20, 80);
    doc.text(`Total: $${shipping.totalAmount.toFixed(2)}`, 20, 90);

    // Add shipping information
    doc.setFont('helvetica', 'bold');
    doc.text('Shipping Information', 20, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`Method: ${shipping.shippingMethod.name}`, 20, 115);
    doc.text(`Cost: $${shipping.shippingMethod.cost}`, 20, 125);
    doc.text(`Est. Delivery: ${shipping.shippingMethod.estimatedDelivery}`, 20, 135);
    doc.text(`Tracking: ${shipping.trackingNumber || 'Not assigned'}`, 20, 145);

    // Add shipping address
    doc.setFont('helvetica', 'bold');
    doc.text('Shipping Address', 20, 160);
    doc.setFont('helvetica', 'normal');
    doc.text(`${shipping.shippingAddress.firstName} ${shipping.shippingAddress.lastName}`, 20, 170);
    doc.text(`${shipping.shippingAddress.address}`, 20, 180);
    doc.text(`${shipping.shippingAddress.city}, ${shipping.shippingAddress.state} ${shipping.shippingAddress.zipCode}`, 20, 190);
    doc.text(`${shipping.shippingAddress.country}`, 20, 200);
    doc.text(`${shipping.shippingAddress.phone}`, 20, 210);

    // Add footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Serendib Gems', 20, 280);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 285);
    doc.text(`Page 1`, 190, 285, { align: 'right' });

    // Save the PDF
    doc.save(`shipping-order-${shipping._id.slice(-8)}.pdf`);

    showNotification('PDF downloaded successfully', 'success');
  };

  // Generate PDF with filtered shipping orders (Updated)
  const generateAllPDF = () => {
    const doc = new jsPDF();

    // Add border
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287, 'S');

    // Add logo
    doc.addImage(logo, 'JPEG', 20, 10, 50, 20);

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Filtered Shipping Orders Report', 80, 25); // Updated title to reflect filtered orders

    // Add date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 80, 35);

    // Add summary (Updated to use filteredShippings)
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Orders: ${filteredShippings.length}`, 20, 60);
    doc.text(`Pending: ${filteredShippings.filter(s => s.status === 'pending').length}`, 20, 70);
    doc.text(`Processing: ${filteredShippings.filter(s => s.status === 'processing').length}`, 20, 80);
    doc.text(`Shipped: ${filteredShippings.filter(s => s.status === 'shipped').length}`, 20, 90);
    doc.text(`Delivered: ${filteredShippings.filter(s => s.status === 'delivered').length}`, 20, 100);
    doc.text(`Cancelled: ${filteredShippings.filter(s => s.status === 'cancelled').length}`, 20, 110);

    // Create table (Already using filteredShippings)
    autoTable(doc, {
      startY: 120,
      head: [["Order ID", "Customer", "Product", "Amount", "Status", "Tracking"]],
      body: filteredShippings.map(shipping => [
        shipping._id.slice(-8),
        shipping.customerEmail,
        shipping.orderItem?.name || 'N/A',
        `$${shipping.totalAmount.toFixed(2)}`,
        shipping.status,
        shipping.trackingNumber || 'N/A'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      didDrawPage: (data) => {
        // Add footer on each page
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Serendib Gems', 20, 280);
        doc.text(`Page ${data.pageNumber}`, 190, 285, { align: 'right' });
      }
    });

    // Save the PDF
    doc.save('filtered-shipping-orders.pdf'); // Updated filename to reflect filtered orders

    showNotification('Filtered orders PDF downloaded successfully', 'success'); // Updated notification message
  };

  // Filter and sort shipping orders
  const filteredShippings = shippings
    .filter((shipping) => {
      const matchesStatus = filterStatus === 'all' || shipping.status === filterStatus;
      const matchesSearch =
        searchTerm === '' ||
        shipping._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipping.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shipping.trackingNumber &&
          shipping.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shipping.orderItem?.name &&
          shipping.orderItem.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'totalAmount') {
        comparison = a.totalAmount - b.totalAmount;
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else {
        comparison = a[sortField] < b[sortField] ? -1 : a[sortField] > b[sortField] ? 1 : 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Toggle sort direction
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) return <div className="sg-loading-container"><div className="sg-loading-spinner"></div></div>;
  if (error) return <div className="sg-error-container">{error}</div>;

  return (
    <div className="sg-dashboard-container">
      {/* Sidebar */}
      <nav className="sg-sidebar">
        <div className="sg-sidebar-header">
          <div className="sg-logo">
            <div className="sg-logo-icon">
              <i className="fas fa-gem"></i>
            </div>
            <div className="sg-logo-text">Serendib Gems</div>
          </div>
        </div>

        <ul className="sg-nav-items">
          <li className="sg-nav-item">
            <Link to="/dashboard" className="sg-nav-link">
              <i className="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="sg-nav-item">
            <Link to="/users" className="sg-nav-link">
              <i className="fas fa-users"></i>
              <span>User Management</span>
            </Link>
          </li>
          <li className="sg-nav-item">
            <Link to="/gemdashboard" className="sg-nav-link">
              <i className="fas fa-boxes"></i>
              <span>Inventory Management</span>
            </Link>
          </li>
          <li className="sg-nav-item">
            <Link to="/financereport" className="sg-nav-link">
              <i className="fas fa-dollar-sign"></i>
              <span>Financial Management</span>
            </Link>
          </li>
          <li className="sg-nav-item">
            <Link to="/cutting" className="sg-nav-link">
              <i className="fas fa-cut"></i>
              <span>Gem Cutting</span>
            </Link>
          </li>
          <li className="sg-nav-item">
            <Link to="/delivery" className="sg-nav-link active">
              <i className="fas fa-truck"></i>
              <span>Delivery Management</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="sg-main-content">
        <div className="sg-shipping-dashboard">
          {notification.show && (
            <div className={`sg-notification ${notification.type}`}>{notification.message}</div>
          )}
          
          <header className="sg-dashboard-header">
            <h1 className="sg-dashboard-title">Shipping Orders Management</h1>
            <div className="sg-dashboard-summary">
              <div className="sg-summary-item">
                <span className="sg-summary-value">{shippings.length}</span>
                <span className="sg-summary-label">Total Orders</span>
              </div>
              <div className="sg-summary-item">
                <span className="sg-summary-value">
                  {shippings.filter((s) => s.status === 'pending').length}
                </span>
                <span className="sg-summary-label">Pending</span>
              </div>
              <div className="sg-summary-item">
                <span className="sg-summary-value">
                  {shippings.filter((s) => s.status === 'processing').length}
                </span>
                <span className="sg-summary-label">Processing</span>
              </div>
              <div className="sg-summary-item">
                <span className="sg-summary-value">
                  {shippings.filter((s) => s.status === 'shipped').length}
                </span>
                <span className="sg-summary-label">Shipped</span>
              </div>
              <div className="sg-summary-item">
                <span className="sg-summary-value">
                  {shippings.filter((s) => s.status === 'delivered').length}
                </span>
                <span className="sg-summary-label">Delivered</span>
              </div>
            </div>
          </header>

          <div className="sg-dashboard-controls">
            <div className="sg-search-container">
              <input
                type="text"
                className="sg-search-input"
                placeholder="Search orders by ID, email, tracking or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="sg-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div className="sg-filter-container">
              <label className="sg-filter-label">Filter by Status:</label>
              <select
                className="sg-filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="sg-sort-container">
              <label className="sg-filter-label">Sort by:</label>
              <select
                className="sg-filter-select"
                value={sortField}
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="_id">Order ID</option>
                <option value="totalAmount">Amount</option>
                <option value="createdAt">Date</option>
                <option value="status">Status</option>
              </select>
              <button 
                className="sg-sort-direction-btn" 
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {filteredShippings.length === 0 ? (
            <div className="sg-no-results">No shipping orders match your search criteria</div>
          ) : (
            <div className="sg-shipping-grid">
              {filteredShippings.map((shipping) => (
                <div key={shipping._id} className="sg-shipping-card">
                  <div className="sg-shipping-header">
                    <div className="sg-shipping-id">#{shipping._id.slice(-8)}</div>
                    <div className={`sg-shipping-status sg-status-${shipping.status}`}>
                      {shipping.status}
                    </div>
                  </div>
                  
                  <div className="sg-shipping-body">
                    <div className="sg-shipping-section">
                      <h3 className="sg-section-title">Order Details</h3>
                      <div className="sg-shipping-detail">
                        <span className="sg-detail-label">Customer:</span>
                        <span className="sg-detail-value">{shipping.customerEmail}</span>
                      </div>
                      <div className="sg-shipping-detail">
                        <span className="sg-detail-label">Product:</span>
                        <span className="sg-detail-value">{shipping.orderItem?.name || 'N/A'}</span>
                      </div>
                      <div className="sg-shipping-detail">
                        <span className="sg-detail-label">Quantity:</span>
                        <span className="sg-detail-value">{shipping.quantity}</span>
                      </div>
                      <div className="sg-shipping-detail">
                        <span className="sg-detail-label">Total:</span>
                        <span className="sg-detail-value sg-price">${shipping.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="sg-shipping-section">
                      <h3 className="sg-section-title">Shipping Information</h3>
                      <div className="sg-shipping-detail">
                        <span className="sg-detail-label">Method:</span>
                        <span className="sg-detail-value">{shipping.shippingMethod.name}</span>
                      </div>
                      <div className="sg-shipping-detail">
                        <span className="sg-detail-label">Cost:</span>
                        <span className="sg-detail-value">${shipping.shippingMethod.cost}</span>
                      </div>
                      <div className="sg-shipping-detail">
                        <span className="sg-detail-label">Est. Delivery:</span>
                        <span className="sg-detail-value">{shipping.shippingMethod.estimatedDelivery}</span>
                      </div>
                      <div className="sg-shipping-detail">
                        <span className="sg-detail-label">Tracking:</span>
                        <span className="sg-detail-value">
                          {shipping.trackingNumber ? (
                            <a href={`https://track.example.com/${shipping.trackingNumber}`} target="_blank" rel="noopener noreferrer">
                              {shipping.trackingNumber}
                            </a>
                          ) : (
                            'Not assigned'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sg-shipping-address">
                    <h3 className="sg-section-title">Shipping Address</h3>
                    <p className="sg-address-text">
                      {`${shipping.shippingAddress.firstName} ${shipping.shippingAddress.lastName}`}<br />
                      {shipping.shippingAddress.address}<br />
                      {`${shipping.shippingAddress.city}, ${shipping.shippingAddress.state} ${shipping.shippingAddress.zipCode}`}<br />
                      {shipping.shippingAddress.country}<br />
                      {shipping.shippingAddress.phone}
                    </p>
                  </div>

                  <div className="sg-shipping-actions">
                    <div className="sg-action-row">
                      <select
                        className="sg-action-select"
                        value={selectedStatus[shipping._id] || shipping.status}
                        onChange={(e) =>
                          setSelectedStatus({
                            ...selectedStatus,
                            [shipping._id]: e.target.value,
                          })
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleStatusUpdate(shipping._id)}
                        className="sg-action-button sg-update-status"
                      >
                        Update Status
                      </button>
                    </div>
                    
                    <div className="sg-action-row">
                      <input
                        type="text"
                        className="sg-action-input"
                        placeholder="Enter tracking number"
                        value={selectedTracking[shipping._id] || ''}
                        onChange={(e) =>
                          setSelectedTracking({
                            ...selectedTracking,
                            [shipping._id]: e.target.value,
                          })
                        }
                      />
                      <button
                        onClick={() => handleTrackingUpdate(shipping._id)}
                        className="sg-action-button sg-update-tracking"
                      >
                        Set Tracking
                      </button>
                    </div>
                    
                    <div className="sg-action-row sg-action-buttons-group">
                      <button
                        onClick={() => handleDelete(shipping._id)}
                        className="sg-action-button sg-delete-button"
                      >
                        <svg className="sg-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Delete
                      </button>
                      <button className="sg-action-button sg-print-button" onClick={() => window.print()}>
                        <svg className="sg-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 6 2 18 2 18 9"></polyline>
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                          <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        Print
                      </button>
                      <button 
                        className="sg-action-button sg-pdf-button"
                        onClick={() => generatePDF(shipping)}
                      >
                        <svg className="sg-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2 lbs12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredShippings.length > 0 && (
            <div className="sg-download-all-container">
              <button 
                className="sg-download-all-button"
                onClick={generateAllPDF}
              >
                <svg className="sg-download-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Filtered Orders as PDF {/* Updated button text to reflect filtered orders */}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShippingDisplay;