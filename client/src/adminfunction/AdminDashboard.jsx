import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './css/AdminDashboard.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/serendib-gems-logo.jpeg';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const logoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      applyFilters();
    }
  }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        navigate('/login');
        return;
      }
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data.Users || [];
      setUsers(userData);
      setFilteredUsers(userData);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Users Error:', err.response || err.message);
      const errorMessage =
        err.response?.status === 401
          ? 'Unauthorized. Please log in again.'
          : err.response?.data?.message || 'Failed to fetch users';
      setError(errorMessage);
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((user) => user._id !== userId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const applyFilters = () => {
    let result = [...users];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((user) =>
        (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }

    if (filterRole !== 'all') {
      result = result.filter((user) =>
        user.role === filterRole || user.userType === filterRole
      );
    }

    setFilteredUsers(result);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };

  const generatePDF = (dataSet, title) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(0, 48, 120);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    if (logoRef.current) {
      const imgData = logoRef.current;
      doc.addImage(imgData, 'JPEG', 15, 15, 30, 30);
    }

    doc.setFontSize(18);
    doc.setTextColor(0, 48, 120);
    doc.text("Serendib Gems", pageWidth / 2, 25, { align: "center" });

    doc.setFontSize(14);
    doc.text(title, pageWidth / 2, 35, { align: "center" });

    doc.setFontSize(10);
    const today = new Date();
    doc.text(`Generated on: ${today.toLocaleDateString()}`, pageWidth / 2, 42, { align: "center" });

    autoTable(doc, {
      startY: 50,
      head: [["Name", "Username", "Email", "Phone", "Role"]],
      body: dataSet.map((user) => [
        user.fullName || user.firstName || 'Unnamed User',
        user.username || 'N/A',
        user.email || 'N/A',
        user.phoneNumber || user.phone || 'N/A',
        user.role || user.userType || 'N/A',
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [0, 48, 120],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      margin: { top: 50, left: 15, right: 15 },
    });

    const footerText = "© Serendib Gems - Confidential User Information";
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: "center" });

    doc.save(`serendib-gems-${title.toLowerCase().replace(/\s+/g, '-')}-${today.toISOString().split('T')[0]}.pdf`);
  };

  const downloadUserPDF = (user) => {
    const userName = user.fullName || user.firstName || user.username || "User";
    generatePDF([user], `User Details - ${userName}`);
  };

  if (loading) return <div className="admin-loader">Loading...</div>;
  if (error) return <div className="admin-error-message">{error}</div>;

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
              <Link to="/users" className="fin-dash-nav-link active">
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
              <Link to="/financereport" className="fin-dash-nav-link">
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
          <div className="admin-dashboard-wrapper">
            <img
              ref={logoRef}
              src={logo}
              alt="Serendib Gems Logo"
              style={{ display: 'none' }}
              onLoad={() => {
                logoRef.current = logo;
              }}
            />

            <div className="admin-top-header">
              <div className="admin-header-branding">
                <img src={logo} alt="Serendib Gems Logo" className="admin-logo" />
                <h1 className="admin-panel-title">Serendib Gems - User Management</h1>
              </div>
              <button className="admin-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <div className="admin-stats-overview">
              <div className="admin-stat-card">
                <h3>Total Users</h3>
                <p className="admin-stat-number">{users.length}</p>
              </div>
              <div className="admin-stat-card">
                <h3>Admins</h3>
                <p className="admin-stat-number">
                  {users.filter((user) => user.role === 'admin' || user.userType === 'admin').length}
                </p>
              </div>
              <div className="admin-stat-card">
                <h3>Regular Users</h3>
                <p className="admin-stat-number">
                  {users.filter((user) => user.role === 'user' || user.userType === 'user').length}
                </p>
              </div>
              <div className="admin-stat-card admin-download-card">
                <h3>Export Data</h3>
                <button
                  className="admin-download-btn"
                  onClick={() => generatePDF(users, "Complete User Directory")}
                >
                  Download All Users PDF
                </button>
              </div>
            </div>

            {users.length === 0 ? (
              <p className="admin-no-users-message">No users found in the database</p>
            ) : (
              <div className="admin-data-table-container">
                <div className="admin-filter-controls">
                  <h2 className="admin-section-title">User Directory</h2>
                  <div className="admin-search-filter-wrapper">
                    <div className="admin-search-container">
                      <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                    <div className="admin-filter-container">
                      <select
                        className="admin-filter-select"
                        value={filterRole}
                        onChange={handleRoleFilterChange}
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                    <button
                      className="admin-filtered-download-btn"
                      onClick={() => generatePDF(filteredUsers, "Filtered User List")}
                      disabled={filteredUsers.length === 0}
                    >
                      Download Filtered PDF
                    </button>
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <p className="admin-no-results">No users match your search criteria</p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-users-table">
                      <thead className="admin-table-header">
                        <tr>
                          <th className="admin-table-heading">Name</th>
                          <th className="admin-table-heading">Username</th>
                          <th className="admin-table-heading">Email</th>
                          <th className="admin-table-heading">Phone</th>
                          <th className="admin-table-heading">Role</th>
                          <th className="admin-table-heading">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user._id} className="admin-table-row">
                            <td className="admin-table-cell">{user.fullName || user.firstName || 'Unnamed User'}</td>
                            <td className="admin-table-cell">{user.username || 'N/A'}</td>
                            <td className="admin-table-cell admin-email-cell">{user.email || 'N/A'}</td>
                            <td className="admin-table-cell">{user.phoneNumber || user.phone || 'N/A'}</td>
                            <td className="admin-table-cell">
                              <span
                                className={`admin-role-badge ${
                                  user.role === 'admin' || user.userType === 'admin'
                                    ? 'admin-role-admin'
                                    : 'admin-role-user'
                                }`}
                              >
                                {user.role || user.userType || 'N/A'}
                              </span>
                            </td>
                            <td className="admin-table-cell admin-actions-cell">
                              <button
                                className="admin-pdf-btn"
                                onClick={() => downloadUserPDF(user)}
                                title="Download user details as PDF"
                              >
                                PDF
                              </button>
                              <button
                                className="admin-edit-btn"
                                onClick={() => navigate(`/admin/users/${user._id}/edit`)}
                              >
                                Edit
                              </button>
                              <button
                                className="admin-delete-btn"
                                onClick={() => handleDelete(user._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;