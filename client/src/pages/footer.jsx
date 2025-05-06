import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import "./css/footer.css"; // Ensure this CSS file exists

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Brand Section */}
        <div className="footer-brand">
          <h2>Serendib Gems</h2>
          <p>Gem Buying & Selling System</p>
        </div>

        {/* Footer Links Section */}
        <div className="footer-links">
          <div className="footer-links-column">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/aboutus">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/shippingpolicy">Shipping Policy</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h3>Services</h3>
            <ul>
              <li>
                <Link to="/geminven">Buy Gems</Link>
              </li>
              <li>
                <Link to="/add-gem">Sell Gems</Link>
              </li>
              <li>
                <Link to="/track">Gem Track</Link>
              </li>
              <li>
                <Link to="/gemcutting">Gem Cutting</Link>
              </li>
              <li>
                <Link to="/chat">Gem Assistance</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h3>Contact Us</h3>
            <ul>
              <li>123 Gem Avenue, City, Country</li>
              <li>Email: support@serendibgems.com</li>
              <li>Phone: +123 456 7890</li>
            </ul>
          </div>
        </div>

        {/* Social Icons */}
        <div className="footer-social-icons">
          <a href="https://www.facebook.com/SerendibGems" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="social-icon" />
          </a>
          <a href="https://www.instagram.com/SerendibGems" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="social-icon" />
          </a>
          <a href="https://www.twitter.com/SerendibGems" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="social-icon" />
          </a>
          <a href="https://www.linkedin.com/company/SerendibGems" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="social-icon" />
          </a>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="footer-bottom">
        <p>© 2025 Serendib Gems. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
