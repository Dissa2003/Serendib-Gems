// client/src/pages/home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaClipboardList, FaFileAlt, FaThLarge, FaGem, FaArrowRight } from "react-icons/fa";
import Button from "../components/ui/button";
import Navbar from "./Navbar";
import Footer from "./footer";
import './css/home.css';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Sample data for recent gems
  const recentGems = [
    { id: 1, name: "Ruby Star", type: "Ruby", date: "2023-06-15", status: "Available", price: "$1,200", color: "Deep Red" },
    { id: 2, name: "Blue Sapphire", type: "Sapphire", date: "2023-06-12", status: "Reserved", price: "$1,800", color: "Royal Blue" },
    { id: 3, name: "Emerald Cut", type: "Emerald", date: "2023-06-10", status: "Sold", price: "$2,500", color: "Vibrant Green" },
    { id: 4, name: "Ceylon Yellow", type: "Sapphire", date: "2023-06-08", status: "Available", price: "$950", color: "Yellow" }
  ];

  // Filter gems based on active tab
  const filteredGems = activeTab === 'all' 
    ? recentGems 
    : recentGems.filter(gem => gem.status.toLowerCase() === activeTab);

  useEffect(() => {
    // Animation for elements to fade in
    setIsVisible(true);
    
    // Parallax effect for hero section
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        heroSection.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section with Parallax Effect */}
      <section className="hero-section">
        <div className={`hero-overlay ${isVisible ? 'visible' : ''}`}></div>
        <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
          <div className="gem-icon-container">
            <FaGem className="gem-icon" />
          </div>
          <h1>Serendib Gems Inventory</h1>
          <p>Discover the brilliance of precision gem management</p>
          <div className="hero-buttons">
            <Button className="primary-button">
              <Link to="/geminven">Explore Collection</Link>
            </Button>
            <Button className="secondary-button">
              <Link to="/add-gem">Add New Gem</Link>
            </Button>
          </div>
        </div>
        <div className="wave-container">
          <svg className="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`stats-section ${isVisible ? 'visible' : ''}`}>
        <div className="stat-card">
          <div className="stat-number">1,250+</div>
          <div className="stat-label">Gems Cataloged</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">24</div>
          <div className="stat-label">Gem Categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">98%</div>
          <div className="stat-label">Inventory Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">$2.4M</div>
          <div className="stat-label">Total Value</div>
        </div>
      </section>

      {/* Quick Access Section with Animation */}
      <section className="quick-access-section">
        <h2 className="section-title">Quick Access</h2>
        <div className="quick-access">
          <QuickAccessCard icon={<FaPlus />} text="Add New Gem" link="/add-gem" color="#4299e1" />
          <QuickAccessCard icon={<FaClipboardList />} text="View Inventory" link="/geminven" color="#48bb78" />
          <QuickAccessCard icon={<FaFileAlt />} text="Generate Reports" link="/reports" color="#ed8936" />
          <QuickAccessCard icon={<FaThLarge />} text="Manage Categories" link="/categories" color="#9f7aea" />
        </div>
      </section>

      {/* Recent Activity Section with Tabs */}
      <section className="recent-activity-section">
        <div className="section-header">
          <h2 className="section-title">Recent Gems</h2>
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
              Available
            </button>
            <button 
              className={`tab-button ${activeTab === 'reserved' ? 'active' : ''}`}
              onClick={() => setActiveTab('reserved')}
            >
              Reserved
            </button>
            <button 
              className={`tab-button ${activeTab === 'sold' ? 'active' : ''}`}
              onClick={() => setActiveTab('sold')}
            >
              Sold
            </button>
          </div>
        </div>

        <div className="gem-table-container">
          <table className="gem-table">
            <thead>
              <tr>
                <th>Gem Name</th>
                <th>Type</th>
                <th>Color</th>
                <th>Price</th>
                <th>Date Added</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredGems.map(gem => (
                <tr key={gem.id}>
                  <td>
                    <div className="gem-name">
                      <span className="gem-indicator" style={{ backgroundColor: gem.color === 'Deep Red' ? '#e53e3e' : gem.color === 'Royal Blue' ? '#3182ce' : gem.color === 'Vibrant Green' ? '#38a169' : '#ecc94b' }}></span>
                      {gem.name}
                    </div>
                  </td>
                  <td>{gem.type}</td>
                  <td>{gem.color}</td>
                  <td>{gem.price}</td>
                  <td>{gem.date}</td>
                  <td>
                    <span className={`status-badge status-${gem.status.toLowerCase()}`}>
                      {gem.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="view-all-link">
          <Link to="/geminven">
            View All Gems <FaArrowRight className="arrow-icon" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Our System</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Accurate Tracking</h3>
            <p>Keep precise records of your entire gem collection with detailed attributes and history.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3>Responsive Design</h3>
            <p>Access your inventory from any device - desktop, tablet, or mobile phone.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h3>Advanced Analytics</h3>
            <p>Generate comprehensive reports and gain insights into your gem collection's value and trends.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>Secure Storage</h3>
            <p>Your data is protected with enterprise-grade security and regular automated backups.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Optimize Your Gem Inventory?</h2>
          <p>Start managing your collection with precision and ease today.</p>
          <Button className="cta-button">
            <Link to="/geminven">Get Started Now</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const QuickAccessCard = ({ icon, text, link, color }) => (
  <Link to={link} className="quick-access-card">
    <div className="card-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <p>{text}</p>
    <div className="card-arrow">
      <FaArrowRight />
    </div>
  </Link>
);

export default HomePage;
