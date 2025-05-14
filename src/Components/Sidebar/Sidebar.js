import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <nav className="sidebar-unique">
      <div className="sidebar-header-unique">
        <div className="logo-unique">
          <div className="logo-icon-unique">
            <i className="fas fa-gem"></i>
          </div>
          <div className="logo-text-unique">GemSystem</div>
        </div>
      </div>

      <ul className="nav-items-unique">
        <li className="nav-item-unique">
          <Link to="/admindashboard" className="nav-link-unique active">
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        
        <li className="nav-item-unique">
          <Link to="/mainhome" className="nav-link-unique">
            <i className="fas fa-users"></i>
            <span>User Management</span>
          </Link>
        </li>
        <br></br>
        <li className="nav-item-unique">
          <Link to="/inventory" className="nav-link-unique">
            <i className="fas fa-boxes"></i>
            <span>Inventory Management</span>
          </Link>
        </li>
        <br></br>
        <li className="nav-item-unique">
          <Link to="/finance" className="nav-link-unique">
            <i className="fas fa-dollar-sign"></i>
            <span>Financial Management</span>
          </Link>
        </li>
        <br></br>
        <li className="nav-item-unique">
          <Link to="/cutting" className="nav-link-unique">
            <i className="fas fa-cut"></i>
            <span>Gem Cutting</span>
          </Link>
        </li>
        <br></br>
        <li className="nav-item-unique">
          <Link to="/delivery" className="nav-link-unique">
            <i className="fas fa-truck"></i>
            <span>Delivery Management</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;