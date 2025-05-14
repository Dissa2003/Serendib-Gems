import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../Nav/Nav";
import { ThemeContext } from "../../ThemeContext";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { theme } = useContext(ThemeContext);
  const [userCount, setUserCount] = useState(0);

  // Fetch user count from the backend
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch("http://localhost:8000/users");
        const data = await response.json();
        if (response.ok && data.Users) {
          setUserCount(data.Users.length);
        } else {
          console.error("Error fetching users:", data.message);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUserCount();
  }, []);

  // Metrics with dynamic user count
  const metrics = {
    totalUsers: userCount,
    inventoryItems: 320,
    revenue: "$45,000",
    pendingDeliveries: 12,
  };

  return (
    <div className={`admin-dashboard-container ${theme}`}>
      <main className="admin-dashboard-content">
        <Nav />

        {/* Metrics Overview */}
        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <i className="fas fa-users" style={{ color: "#6366f1" }}></i>
            </div>
            <div>
              <h3 className="admin-metric-title">Total Employees</h3>
              <p className="admin-metric-value">{metrics.totalUsers}</p>
            </div>
            <span className="admin-metric-badge">+5 New</span>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <i className="fas fa-boxes" style={{ color: "#10b981" }}></i>
            </div>
            <div>
              <h3 className="admin-metric-title">Inventory Items</h3>
              <p className="admin-metric-value">{metrics.inventoryItems}</p>
            </div>
            <span className="admin-metric-badge">+10 Added</span>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <i className="fas fa-dollar-sign" style={{ color: "#f59e0b" }}></i>
            </div>
            <div>
              <h3 className="admin-metric-title">Monthly Revenue</h3>
              <p className="admin-metric-value">{metrics.revenue}</p>
            </div>
            <span className="admin-metric-badge">+15%</span>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <i className="fas fa-truck" style={{ color: "#8b5cf6" }}></i>
            </div>
            <div>
              <h3 className="admin-metric-title">Pending Deliveries</h3>
              <p className="admin-metric-value">{metrics.pendingDeliveries}</p>
            </div>
            <span className="admin-metric-badge">2 Urgent</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-quick-actions">
          <h2 className="admin-section-title">Quick Actions</h2>
          <div className="admin-actions-grid">
            <Link to="/adduser" className="admin-action-btn">
              <i className="fas fa-user-plus"></i>
              <span>Add User</span>
            </Link>
            <Link to="/inventory/add" className="admin-action-btn">
              <i className="fas fa-plus-circle"></i>
              <span>Add Inventory</span>
            </Link>
            <Link to="/finance/invoices" className="admin-action-btn">
              <i className="fas fa-file-invoice-dollar"></i>
              <span>Create Invoice</span>
            </Link>
            <Link to="/delivery/assign" className="admin-action-btn">
              <i className="fas fa-truck"></i>
              <span>Assign Delivery</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="admin-dashboard-grid">
          {/* User Management Card */}
          <div className="admin-dashboard-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <div className="admin-card-icon" style={{ backgroundColor: "#e0e7ff" }}>
                  <i className="fas fa-users" style={{ color: "#6366f1" }}></i>
                </div>
                User Management
              </h2>
            </div>
            <div className="admin-btn-group">
              <Link to="/userdetails" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-eye" style={{ color: "#6366f1" }}></i>
                </div>
                <span>View Users</span>
              </Link>
              <Link to="/adduser" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-user-plus" style={{ color: "#6366f1" }}></i>
                </div>
                <span>Add New User</span>
              </Link>
              <Link to="/userdetails/:id/update" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-user-shield" style={{ color: "#6366f1" }}></i>
                </div>
                <span>Manage Roles</span>
              </Link>
              <Link to="/reports" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-file-alt" style={{ color: "#6366f1" }}></i>
                </div>
                <span>User Reports</span>
              </Link>
            </div>
          </div>

          {/* Inventory Management Card */}
          <div className="admin-dashboard-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <div className="admin-card-icon" style={{ backgroundColor: "#d1fae5" }}>
                  <i className="fas fa-boxes" style={{ color: "#10b981" }}></i>
                </div>
                Inventory Management
              </h2>
            </div>
            <div className="admin-btn-group">
              <Link to="/inventory/gems" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-gem" style={{ color: "#10b981" }}></i>
                </div>
                <span>Manage Gem Stock</span>
              </Link>
              <Link to="/inventory/add" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-plus-circle" style={{ color: "#10b981" }}></i>
                </div>
                <span>Add Inventory</span>
              </Link>
              <Link to="/inventory/reports" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-file-alt" style={{ color: "#10b981" }}></i>
                </div>
                <span>Inventory Reports</span>
              </Link>
            </div>
          </div>

          {/* Financial Management Card */}
          <div className="admin-dashboard-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <div className="admin-card-icon" style={{ backgroundColor: "#fef3c7" }}>
                  <i className="fas fa-dollar-sign" style={{ color: "#f59e0b" }}></i>
                </div>
                Financial Management
              </h2>
            </div>
            <div className="admin-btn-group">
              <Link to="/finance/overview" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-chart-pie" style={{ color: "#f59e0b" }}></i>
                </div>
                <span>Financial Overview</span>
              </Link>
              <Link to="/finance/invoices" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-file-invoice-dollar" style={{ color: "#f59e0b" }}></i>
                </div>
                <span>Manage Invoices</span>
              </Link>
              <Link to="/finance/reports" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-chart-bar" style={{ color: "#f59e0b" }}></i>
                </div>
                <span>Financial Reports</span>
              </Link>
            </div>
          </div>

          {/* Gem Cutting Management Card */}
          <div className="admin-dashboard-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <div className="admin-card-icon" style={{ backgroundColor: "#ede9fe" }}>
                  <i className="fas fa-cut" style={{ color: "#8b5cf6" }}></i>
                </div>
                Gem Cutting Management
              </h2>
            </div>
            <div className="admin-btn-group">
              <Link to="/cutting/progress" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-tasks" style={{ color: "#8b5cf6" }}></i>
                </div>
                <span>Cutting Progress</span>
              </Link>
              <Link to="/cutting/assign" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-user-cog" style={{ color: "#8b5cf6" }}></i>
                </div>
                <span>Assign Tasks</span>
              </Link>
              <Link to="/cutting/quality" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-check-circle" style={{ color: "#8b5cf6" }}></i>
                </div>
                <span>Quality Control</span>
              </Link>
            </div>
          </div>

          {/* Delivery Management Card */}
          <div className="admin-dashboard-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <div className="admin-card-icon" style={{ backgroundColor: "#e0e7ff" }}>
                  <i className="fas fa-truck" style={{ color: "#4f46e5" }}></i>
                </div>
                Delivery Management
              </h2>
            </div>
            <div className="admin-btn-group">
              <Link to="/delivery/schedule" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-calendar-plus" style={{ color: "#4f46e5" }}></i>
                </div>
                <span>Schedule Delivery</span>
              </Link>
              <Link to="/delivery/assign" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-user-tie" style={{ color: "#4f46e5" }}></i>
                </div>
                <span>Assign Driver</span>
              </Link>
              <Link to="/delivery/track" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-map-marked-alt" style={{ color: "#4f46e5" }}></i>
                </div>
                <span>Track Packages</span>
              </Link>
              <Link to="/delivery/reports" className="admin-dashboard-btn">
                <div className="admin-btn-icon">
                  <i className="fas fa-file-invoice" style={{ color: "#4f46e5" }}></i>
                </div>
                <span>Delivery Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;