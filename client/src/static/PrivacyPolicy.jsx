import React from "react";
import "../pages/css/privacy-policy.css";
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer";

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="privacy-policy-container">
        <div className="privacy-policy-content">
          <h1 className="privacy-policy-title">Privacy Policy</h1>
          <p className="privacy-policy-text">
            Effective date: March 18, 2025
          </p>

          <p>
            We value your privacy. This Privacy Policy explains how we collect, use, and protect your personal data.
          </p>

          <h2 className="privacy-policy-subtitle">Information We Collect</h2>
          <ul className="privacy-policy-list">
            <li><strong>Personal Information:</strong> Includes your name, email address, phone number, etc.</li>
            <li><strong>Usage Data:</strong> Information on how you use our website and services.</li>
            <li><strong>Cookies:</strong> We use cookies to improve your experience on our site.</li>
          </ul>

          <h2 className="privacy-policy-subtitle">How We Use Your Information</h2>
          <ul className="privacy-policy-list">
            <li>To provide and improve our services.</li>
            <li>To communicate with you regarding our services.</li>
            <li>To personalize your experience on our platform.</li>
          </ul>

          <h2 className="privacy-policy-subtitle">How We Protect Your Information</h2>
          <p>
            We use industry-standard security measures to protect your data. However, please note that no data transmission is 100% secure.
          </p>

          <h2 className="privacy-policy-subtitle">Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us.
          </p>

          <h2 className="privacy-policy-subtitle">Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Any significant changes will be posted on this page with the updated date.
          </p>

          <p>If you have any questions, feel free to reach out to us.</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
