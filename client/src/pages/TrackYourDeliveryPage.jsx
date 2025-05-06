import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer";
import { FaBox, FaShippingFast, FaTruck, FaHome, FaCheckCircle, FaSearch, FaCopy } from "react-icons/fa";
import "../pages/css/trackdelivery.css";

const TrackYourDeliveryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: "",
    shippingId: ""
  });
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Get data passed from payment success page if available
  useEffect(() => {
    if (location.state) {
      const { trackingNumber, shippingId } = location.state;
      if (trackingNumber) {
        setTrackingInfo(prev => ({ ...prev, trackingNumber }));
      }
      if (shippingId) {
        setTrackingInfo(prev => ({ ...prev, shippingId }));
      }
      
      // If we have tracking info from state, automatically track it
      if (trackingNumber || shippingId) {
        handleTrackDelivery();
      }
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTrackingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTrackDelivery = async (e) => {
    if (e) e.preventDefault();
    
    if (!trackingInfo.trackingNumber && !trackingInfo.shippingId) {
      setError("Please enter a tracking number or shipping ID");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      let response;
      if (trackingInfo.trackingNumber) {
        response = await axios.get(`http://localhost:8000/api/shipping/track/${trackingInfo.trackingNumber}`);
      } else if (trackingInfo.shippingId) {
        response = await axios.get(`http://localhost:8000/api/shipping/${trackingInfo.shippingId}`);
      }
      
      setDeliveryStatus(response.data);
    } catch (err) {
      console.error("Tracking error:", err);
      setError("Failed to retrieve tracking information. Please check your tracking number or shipping ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getStatusStep = (status) => {
    switch (status) {
      case "pending": return 1;
      case "processing": return 2;
      case "shipped": return 3;
      case "delivered": return 4;
      case "cancelled": return 5;
      default: return 1;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Order Placed";
      case "processing": return "Processing";
      case "shipped": return "Shipped";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      default: return "Unknown";
    }
  };

  return (
    <div className="track-delivery-page">
      <Navbar />
      <div className="track-delivery-container">
        <div className="track-delivery-header">
          <h1>Track Your Delivery</h1>
          <p>Enter your tracking number or shipping ID to get real-time updates on your order</p>
        </div>

        <div className="track-form-container">
          <form onSubmit={handleTrackDelivery} className="track-form">
            <div className="form-group">
              <label>Tracking Number</label>
              <input
                type="text"
                name="trackingNumber"
                placeholder="Enter tracking number"
                value={trackingInfo.trackingNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-divider">OR</div>
            <div className="form-group">
              <label>Shipping ID</label>
              <input
                type="text"
                name="shippingId"
                placeholder="Enter shipping ID"
                value={trackingInfo.shippingId}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="track-button" disabled={loading}>
              {loading ? "Tracking..." : "Track Delivery"} <FaSearch />
            </button>
          </form>
          
          {error && <div className="error-message">{error}</div>}
        </div>

        {deliveryStatus && (
          <div className="delivery-status-container">
            <div className="delivery-status-header">
              <h2>Delivery Status</h2>
              <div className="tracking-details">
                <div className="tracking-detail">
                  <span>Tracking Number:</span>
                  <div className="copy-container">
                    <span>{deliveryStatus.trackingNumber}</span>
                    <button 
                      className="copy-button" 
                      onClick={() => copyToClipboard(deliveryStatus.trackingNumber)}
                      title="Copy tracking number"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <div className="tracking-detail">
                  <span>Shipping ID:</span>
                  <div className="copy-container">
                    <span>{deliveryStatus.shippingId}</span>
                    <button 
                      className="copy-button" 
                      onClick={() => copyToClipboard(deliveryStatus.shippingId)}
                      title="Copy shipping ID"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <div className="tracking-detail">
                  <span>Estimated Delivery:</span>
                  <span>{deliveryStatus.estimatedDelivery}</span>
                </div>
                <div className="tracking-detail">
                  <span>Current Location:</span>
                  <span>{deliveryStatus.currentLocation}</span>
                </div>
              </div>
              {copied && <div className="copied-notification">Copied to clipboard!</div>}
            </div>

            <div className="delivery-progress">
              <div className="progress-tracker">
                <div className={`progress-step ${getStatusStep(deliveryStatus.status) >= 1 ? 'active' : ''}`}>
                  <div className="step-icon">
                    <FaBox />
                  </div>
                  <div className="step-label">Order Placed</div>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${getStatusStep(deliveryStatus.status) >= 2 ? 'active' : ''}`}>
                  <div className="step-icon">
                    <FaShippingFast />
                  </div>
                  <div className="step-label">Processing</div>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${getStatusStep(deliveryStatus.status) >= 3 ? 'active' : ''}`}>
                  <div className="step-icon">
                    <FaTruck />
                  </div>
                  <div className="step-label">Shipped</div>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${getStatusStep(deliveryStatus.status) >= 4 ? 'active' : ''}`}>
                  <div className="step-icon">
                    <FaHome />
                  </div>
                  <div className="step-label">Delivered</div>
                </div>
                {deliveryStatus.status === "cancelled" && (
                  <>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${getStatusStep(deliveryStatus.status) >= 5 ? 'active' : ''}`}>
                      <div className="step-icon">
                        <FaCheckCircle />
                      </div>
                      <div className="step-label">Cancelled</div>
                    </div>
                  </>
                )}
              </div>
              <div className="current-status">
                <div className="status-badge">
                  Current Status: <span>{getStatusText(deliveryStatus.status)}</span>
                </div>
              </div>
            </div>

            <div className="delivery-updates">
              <h3>Delivery Updates</h3>
              <div className="updates-timeline">
                {deliveryStatus.updates.map((update, index) => (
                  <div key={index} className="update-item">
                    <div className="update-icon">
                      <FaCheckCircle />
                    </div>
                    <div className="update-content">
                      <div className="update-header">
                        <span className="update-status">{update.status}</span>
                        <span className="update-datetime">{update.date} at {update.time}</span>
                      </div>
                      <div className="update-location">{update.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TrackYourDeliveryPage;