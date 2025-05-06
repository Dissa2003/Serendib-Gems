import React from "react";
import "../pages/css/aboutus.css";
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer"

const AboutUs = () => {
  return (
    <>
      <Navbar />
      <div className="about-container">
        <div className="about-content">
          <h1 className="about-title">About Serendib Gems</h1>
          <p className="about-text">
            Welcome to <strong>Serendib Gems</strong>, your premier destination for exquisite gemstones. Our platform integrates cutting-edge <strong>AI gem verification</strong>, masterful <strong>gem cutting</strong>, and a secure <strong>gem trading experience</strong> to bring you the finest selection of gems.
          </p>
          <h2 className="about-subtitle">Our Services</h2>
          <ul className="about-list">
            <li>AI-powered Gem Verification for authenticity and grading</li>
            <li>Expertly crafted Gem Cutting services</li>
            <li>Seamless and secure Gem Buying & Selling marketplace</li>
            <li>Comprehensive Gem Reports for buyers and sellers</li>
          </ul>
          <h2 className="about-subtitle">Why Choose Serendib Gems?</h2>
          <p className="about-text">
            At Serendib Gems, we believe in transparency, quality, and security. Our AI-driven verification process ensures each gem meets the highest standards. Whether you're a collector, jeweler, or investor, we offer a trusted marketplace designed for excellence.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
