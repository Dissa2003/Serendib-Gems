import React from "react";
import "../pages/css/contactus.css";
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer"

const ContactUs = () => {
  return (
    <>
      <Navbar />
      <div className="contact-container">
        <div className="contact-content">
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-text">
            Have any questions or need assistance? Feel free to reach out to us!  
            Our team at <strong>Serendib Gems</strong> is always here to help.
          </p>
          <div className="contact-details">
            <h2>Our Office</h2>
            <p>123 Gemstone Avenue, Sydney, Australia</p>
            <h2>Email</h2>
            <p>support@serendibgems.com</p>
            <h2>Phone</h2>
            <p>+61 123 456 789</p>
          </div>
          <h2 className="contact-subtitle">Send Us a Message</h2>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default ContactUs;
