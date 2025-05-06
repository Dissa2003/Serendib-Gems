import React from "react";
import { Link } from "react-router-dom";
import Nav from './Navbar';  // Ensure Nav is a valid React component
import './css/Nav.css';
import './css/aHome.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import FontAwesome

function AdminHome() {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
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
            <Link to="/dashboard" className="nav-link active">
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
            <Link to="/financereport" className="nav-link">
              <i className="fas fa-dollar-sign"></i>
              <span>Financial Management</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/cutting" className="nav-link">
              <i className="fas fa-cut"></i>
              <span>Gem Cutting</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/delivery" className="nav-link">
              <i className="fas fa-truck"></i>
              <span>Delivery Management</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Nav /> {/* Ensure this is a valid component */}

        <div className="top-bar">
          <h1 className="page-title">Dashboard Overview</h1>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="dashboard-grid">
          {/* User Management Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">
                <i className="fas fa-users"></i> User Management
              </h2>
            </div>
            <div className="btn-group">
              <Link to="/users" className="dashboard-btn">
                <i className="fas fa-eye"></i> View Users
              </Link>
              <Link to="/add" className="dashboard-btn">
                <i className="fas fa-user-plus"></i> Add New User
              </Link>
              <Link to="/users/roles" className="dashboard-btn">
                <i className="fas fa-user-shield"></i> Manage User Roles
              </Link>
              <Link to="/users/reset-password" className="dashboard-btn">
                <i className="fas fa-key"></i> Reset User Password
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminHome;
