import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Nav.css';

const Nav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  const dropdownRef = useRef(null);
  const profileBtnRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isDropdownOpen &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !profileBtnRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);
  
  const handleSettingsClick = () => {
    navigate('/settings');
  };
  
  const isLinkActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <div className="logo-section">
          <img src="/gem6.png" alt="SerendibGems Logo" className="logo" />
          <div className="brand-name-container">
            <span className="brand-name-main">Serendib</span>
            <span className="brand-name-sub">Gems</span>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isLinkActive('/dashboard') ? 'active' : ''}`}
          >
            <i className="fas fa-chart-line mr-2"></i>Dashboard
          </Link>
          <Link 
            to="/mainhome" 
            className={`nav-link ${isLinkActive('/mainhome') ? 'active' : ''}`}
          >
            <i className="fas fa-users mr-2"></i>Employees
          </Link>
          <Link 
            to="/inventory" 
            className={`nav-link ${isLinkActive('/inventory') ? 'active' : ''}`}
          >
            <i className="fas fa-gem mr-2"></i>Inventory
          </Link>
          <Link 
            to="/finance" 
            className={`nav-link ${isLinkActive('/finance') ? 'active' : ''}`}
          >
            <i className="fas fa-coins mr-2"></i>Finance
          </Link>
          <Link 
            to="/gem-cutting" 
            className={`nav-link ${isLinkActive('/gem-cutting') ? 'active' : ''}`}
          >
            <i className="fas fa-cut mr-2"></i>Gem Cutting
          </Link>
          <Link 
            to="/delivery" 
            className={`nav-link ${isLinkActive('/delivery') ? 'active' : ''}`}
          >
            <i className="fas fa-truck-fast mr-2"></i>Delivery
          </Link>
        </div>
        
        {/* Right Side Controls */}
        <div className="right-section">
          {/* Settings Button */}
          <button 
            className="icon-btn settings-btn" 
            onClick={handleSettingsClick}
          >
            <i className="fas fa-cog"></i>
          </button>
          
          {/* Admin Profile */}
          <div className="relative">
            <button 
              ref={profileBtnRef}
              className="icon-btn profile-btn" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <i className="fas fa-user-circle profile-icon"></i>
            </button>
            
            {/* Dropdown Menu */}
            <div 
              ref={dropdownRef}
              className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}
            >
              <Link to="/profile" className="dropdown-item">
                <i className="fas fa-user"></i>
                <span>Edit Profile</span>
              </Link>
              <Link to="/logout" className="dropdown-item">
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </Link>
            </div>
          </div>
          
          {/* Date and Time */}
          <div className="datetime-container">
            <div className="current-time">{currentTime}</div>
            <div className="current-date">{currentDate}</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;