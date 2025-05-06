import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTruck, FaDownload } from 'react-icons/fa'; // Added FaDownload
import { jsPDF } from "jspdf"; // Added jsPDF import
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer";
import "../pages/css/paymentsucess.css";

const PaymentSuccess = () => {
  const location = useLocation();
  const [orderNumber, setOrderNumber] = useState("");
  
  const { 
    gemData, 
    quantity, 
    totalAmount, 
    transactionId, 
    shippingId, 
    shipping,
    trackingNumber 
  } = location.state || {};
  
  useEffect(() => {
    const randomOrderNum = transactionId ? 
      `ORD-${transactionId.substring(0, 6)}` : 
      "ORD-" + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomOrderNum);
    
    createConfetti();
    
    return () => {
      const confetti = document.querySelectorAll('.confetti');
      confetti.forEach(item => item.remove());
    };
  }, [transactionId]);
  
  const createConfetti = () => {
    const colors = ['#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57', '#54a0ff', '#ff9ff3'];
    const container = document.querySelector('.payment-success-page');
    
    if (!container) return;
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 10 + 5 + 'px';
      confetti.style.opacity = Math.random() * 0.8 + 0.2;
      confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
      confetti.style.animationDelay = Math.random() * 5 + 's';
      
      container.appendChild(confetti);
    }
  };

  const downloadShippingPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Shipping Information", 20, 20);
    
    // Add details
    doc.setFontSize(12);
    doc.text(`Order Number: ${orderNumber}`, 20, 40);
    if (trackingNumber) {
      doc.text(`Tracking Number: ${trackingNumber}`, 20, 50);
    }
    if (shippingId) {
      doc.text(`Shipping ID: ${shippingId}`, 20, 60);
    }
    if (shipping) {
      doc.text(`Shipping Method: ${shipping.name} (${shipping.days} days)`, 20, 70);
    }
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
    
    // Add footer
    doc.setFontSize(10);
    doc.text("Thank you for your purchase!", 20, 100);
    
    // Save the PDF
    doc.save(`shipping-details-${orderNumber}.pdf`);
  };

  return (
    <div className="payment-success-page">
      <Navbar />
      <div className="payment-success-content">
        <div className="success-icon">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" fill="#e6f7ef" stroke="#28a745" strokeWidth="2" />
            <path
              d="M8 12l3 3 5-5"
              stroke="#28a745"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <h1>Payment Successful!</h1>
        <p className="greeting">Congratulations on Your Purchase!</p>
        
        <div className="order-details">
          <h3>Order Summary</h3>
          {gemData && (
            <div className="product-info">
              <h4>{gemData.name}</h4>
              <p>Quantity: {quantity}</p>
              <p>Total Amount: ${totalAmount?.toFixed(2)}</p>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Order Number:</span>
            <span className="detail-value">{orderNumber}</span>
          </div>
          {transactionId && (
            <div className="detail-item">
              <span className="detail-label">Transaction ID:</span>
              <span className="detail-value">{transactionId}</span>
            </div>
          )}
          {shippingId && (
            <div className="detail-item">
              <span className="detail-label">Shipping ID:</span>
              <span className="detail-value">{shippingId}</span>
            </div>
          )}
          {trackingNumber && (
            <div className="detail-item">
              <span className="detail-label">Tracking Number:</span>
              <span className="detail-value">{trackingNumber}</span>
            </div>
          )}
          {shipping && (
            <div className="detail-item">
              <span className="detail-label">Shipping Method:</span>
              <span className="detail-value">{shipping.name} ({shipping.days} days)</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className="detail-value" style={{color: "#28a745", fontWeight: "bold"}}>Confirmed</span>
          </div>
        </div>
        
        <p>Your order has been confirmed and is being processed. You'll receive a confirmation email shortly with all the details.</p>
        
        <p className="highlight">Thank you for choosing our collection. Your exquisite gem will be on its way to you soon!</p>
        
        {(trackingNumber || shippingId) && (
          <button 
            onClick={downloadShippingPDF}
            className="download-shipping-btn"
          >
            <FaDownload /> Download Shipping Details
          </button>
        )}
        
        {trackingNumber && (
          <Link 
            to="/track" 
            state={{ trackingNumber, shippingId }}
            className="track-delivery-btn"
          >
            <FaTruck /> Track Your Delivery
          </Link>
        )}
        
        <Link to="/" className="back-to-home-btn">
          Return to Home
        </Link>
        
        <Link to="/geminven" className="continue-shopping-btn">
          Continue Shopping
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;