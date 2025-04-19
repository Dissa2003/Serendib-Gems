import React from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaClipboardList, FaFileAlt, FaThLarge, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import Button from "../components/ui/button";
import Navbar from "./Navbar"; // Import Navbar
import './css/home.css';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> {/* Use Navbar Component */}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Your Ultimate Solution for Gem Inventory Management</h1>
          <p>Track, manage, and optimize your gem collection seamlessly.</p>
          <Button className="explore-button">
            <Link to="/inventory">Explore Inventory</Link>
          </Button>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="quick-access">
        <QuickAccessCard icon={<FaPlus />} text="Add New Gem" link="/add-gem" />
        <QuickAccessCard icon={<FaClipboardList />} text="View Gem Inventory" link="/inventory" />
        <QuickAccessCard icon={<FaFileAlt />} text="Generate Reports" link="/reports" />
        <QuickAccessCard icon={<FaThLarge />} text="Manage Categories" link="/categories" />
      </section>

      {/* Recent Activity Section */}
      <section className="recent-activity">
        <h2>Recent Activity</h2>
        <table>
          <thead>
            <tr>
              <th>Gem Name</th>
              <th>Type</th>
              <th>Date Added</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ruby Star</td>
              <td>Ruby</td>
              <td>2025-03-10</td>
              <td className="status-available">Available</td>
            </tr>
          </tbody>
        </table>
        <div className="view-all">
          <Link to="/inventory">View All</Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer>
        <div className="footer-links">
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div className="social-icons">
          <FaFacebook className="social-icon" />
          <FaInstagram className="social-icon" />
          <FaTwitter className="social-icon" />
        </div>
        <p>© 2025 Serendib Gems. All rights reserved.</p>
      </footer>
    </div>
  );
};

const QuickAccessCard = ({ icon, text, link }) => (
  <Link to={link} className="quick-access-card">
    <div className="icon">{icon}</div>
    <p>{text}</p>
  </Link>
);

export default HomePage;
