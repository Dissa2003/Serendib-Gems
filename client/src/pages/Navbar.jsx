import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaGem, FaSignOutAlt } from "react-icons/fa";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import "./css/navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? "sg-active" : "";
  };

  return (
    <header className={`sg-navbar-container ${isScrolled ? "sg-scrolled" : ""}`}>
      <div className="sg-navbar-content">
        {/* Left part of navbar */}
        <div className="sg-navbar-left">
          <Link to="/" className="sg-navbar-logo">
            <FaGem className="sg-logo-icon" />
            <div className="sg-logo-text">
              <span className="sg-logo-main">Serendib</span>
              <span className="sg-logo-sub">Gems</span>
            </div>
          </Link>
        </div>

        {/* Center navigation */}
        <nav className={`sg-navbar-center ${mobileMenuOpen ? "sg-mobile-active" : ""}`}>
          <NavItem to="/" text="Home" isActive={isActive("/")} />
          <NavItem to="/geminven" text="Gem Inventory" isActive={isActive("/geminven")} />
          <NavItem to="/gemcat" text="Categories" isActive={isActive("/gemcat")} />
          <NavItem to="/gemcutting" text="Gem Cutting" isActive={isActive("/gemcutting")} />
          <NavItem to="/aboutus" text="About Us" isActive={isActive("/aboutus")} />
          
          {/* Mobile-only logout button */}
          <div className="sg-mobile-buttons">
            <Link to="/welcome" className="sg-logout-button sg-mobile-button">
              <FaSignOutAlt className="sg-logout-icon" />
              <span>Logout</span>
            </Link>
          </div>
        </nav>

        {/* Right part of navbar */}
        <div className="sg-navbar-right">
          {/* Logout button (Desktop) */}
          <Link to="/welcome" className="sg-logout-button sg-desktop-button">
            <FaSignOutAlt className="sg-logout-icon" />
            <span>Logout</span>
          </Link>

          {/* Mobile menu toggle */}
          <button className="sg-mobile-menu-toggle" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <IoMdClose /> : <IoMdMenu />}
          </button>
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ to, text, isActive }) => (
  <Link to={to} className={`sg-nav-item ${isActive}`}>
    <span className="sg-nav-text">{text}</span>
    <div className="sg-nav-item-underline"></div>
  </Link>
);

export default Navbar;