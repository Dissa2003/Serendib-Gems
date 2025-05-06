// client/src/Admin/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/Nav.css';

function Navbar() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const closeDropdown = (e) => {
    if (!e.target.closest('.admin-profile')) {
      setShowProfileDropdown(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', closeDropdown);
    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, []);

  return (
    <nav className="top-nav">
      <div className="nav-container">
        <div className="nav-links">
          <Link to="/financereport" className="nav-item">
            Finance Reports
          </Link>
          <Link to="/findash" className="nav-item">
            Revenues
          </Link>
          <Link to="/userdetails" className="nav-item">
            User Details
          </Link>
          <Link to="/reports" className="nav-item">
            Reports
          </Link>
          <Link to="/settings" className="nav-item">
            Settings
          </Link>
        </div>
        <div className="nav-actions">
          <button className="action-btn">
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </button>
          <button className="action-btn">
            <i className="fas fa-cog"></i>
          </button>
          <button className="action-btn search-btn">
            <i className="fas fa-search"></i>
          </button>
          <div className="admin-profile">
            <button className="profile-btn" onClick={toggleProfileDropdown}>
              <div className="avatar">A</div>
              <span>Admin</span>
              <i className="fas fa-chevron-down"></i>
            </button>
            <div className={`profile-dropdown ${showProfileDropdown ? 'show' : ''}`}>
              <Link to="/profile" className="dropdown-item">
                <i className="fas fa-user"></i>
                <span>Edit Profile</span>
              </Link>
              <Link to="/change-password" className="dropdown-item">
                <i className="fas fa-key"></i>
                <span>Change Password</span>
              </Link>
              <div className="dropdown-divider"></div>
              <Link to="/logout" className="dropdown-item">
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;