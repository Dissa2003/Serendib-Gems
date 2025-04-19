import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";
import "./css/navbar.css";

const Navbar = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-0 w-full z-50">
      <div className="text-2xl font-bold text-blue-600">Serendib Gems</div>
      <nav className="flex gap-6">
        <NavItem to="/" text="Home" />
        <NavItem to="/users" text="Gem Inventory" />
        <NavItem to="/categories" text="Categories" />
        <NavItem to="/reports" text="Reports" />
        <NavItem to="/profile" text="Profile" icon={<FaUserCircle />} />
      </nav>
      <div className="flex items-center gap-4">
        <input type="text" placeholder="Search gems..." className="border p-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300" />
        <FaSearch className="text-gray-600 cursor-pointer hover:text-blue-600" />
        <FaBell className="text-gray-600 cursor-pointer hover:text-blue-600" />
      </div>
    </header>
  );
};

const NavItem = ({ to, text, icon }) => (
  <Link to={to} className="nav-item">
    {icon && <span className="nav-icon">{icon}</span>} {text}
  </Link>
);

export default Navbar;
