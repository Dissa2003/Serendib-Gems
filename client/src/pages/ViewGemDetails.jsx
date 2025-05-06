import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaArrowLeft, 
  FaShoppingCart, 
  FaHeart, 
  FaStar, 
  FaShare, 
  FaRuler, 
  FaWeightHanging, 
  FaGem, 
  FaCertificate,
  FaMoneyBillWave,
  FaChevronRight,
  FaFilePdf,
  FaCheckCircle
} from "react-icons/fa";
import { jsPDF } from "jspdf";
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer";
import "./css/viewGemDetails.css";

const ViewGemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gem, setGem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchaseStatus, setPurchaseStatus] = useState({ message: "", type: "" });
  const [relatedGems, setRelatedGems] = useState([]);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchGemDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/gem/${id}`);
        setGem(response.data);
        
        const relatedResponse = await axios.get(`http://localhost:8000/api/gem?type=${response.data.type}`);
        const filtered = relatedResponse.data
          .filter(g => g._id !== id)
          .slice(0, 4);
        setRelatedGems(filtered);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching gem details:", err);
        setError("Failed to load gem details. Please try again later.");
        setLoading(false);
      }
    };

    fetchGemDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBuyGem = () => {
    navigate('/payment', { 
      state: { 
        gemData: gem, 
        quantity: quantity 
      } 
    });
  };

  const handleAddToCart = () => {
    console.log(`Adding ${quantity} of gem with ID: ${id} to cart`);
    setPurchaseStatus({
      message: `Added ${quantity} ${gem?.name} to your cart!`,
      type: "success"
    });
    
    setTimeout(() => {
      setPurchaseStatus({ message: "", type: "" });
    }, 3000);
  };

  const handleAddToWishlist = () => {
    console.log(`Adding gem with ID: ${id} to wishlist`);
    setPurchaseStatus({
      message: `Added ${gem?.name} to your wishlist!`,
      type: "success"
    });
    
    setTimeout(() => {
      setPurchaseStatus({ message: "", type: "" });
    }, 3000);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const getGemImages = () => {
    if (!gem) return [];
    return [
      `http://localhost:8000${gem.image}`,
      "/images/gem-angle1.jpg",
      "/images/gem-angle2.jpg",
      "/images/gem-angle3.jpg"
    ];
  };

  const getCertificationNumber = () => {
    return `GIA-${Math.floor(1000000 + Math.random() * 9000000)}`;
  };

  const downloadGemDetailsAsPDF = () => {
    if (!gem) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${gem.name} Details`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Type: ${gem.type}`, 10, 20);
    doc.text(`Weight: ${gem.weight} carats`, 10, 30);
    doc.text(`Color: ${gem.color}`, 10, 40);
    doc.text(`Price: $${gem.price.toFixed(2)}`, 10, 50);
    doc.text(`Seller: ${gem.sellerName} (${gem.sellerEmail})`, 10, 60);
    doc.text(`Certification: ${getCertificationNumber()}`, 10, 70);
    doc.text(`Description:`, 10, 80);
    const descriptionLines = doc.splitTextToSize(gem.description, 180);
    doc.text(descriptionLines, 10, 90);
    doc.text(`Verified: ${gem.isVerified ? 'Yes' : 'No'}`, 10, descriptionLines.length * 10 + 100);
    doc.save(`${gem.name}_Details.pdf`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="gem-details-loading">
          <div className="loading-spinner"></div>
          <p>Loading gem details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !gem) {
    return (
      <>
        <Navbar />
        <div className="gem-details-error">
          <h2>Error</h2>
          <p>{error || "Gem not found"}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft /> Go Back
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const gemImages = getGemImages();
  const certNumber = getCertificationNumber();

  return (
    <>
      <Navbar />
      <div className="gem-details-container">
        <div className="gem-details-breadcrumb">
          <Link to="/">Home</Link> <FaChevronRight className="breadcrumb-separator" />
          <Link to="/geminven">Gem Collection</Link> <FaChevronRight className="breadcrumb-separator" />
          <span>{gem.name}</span>
        </div>

        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back to Collection
        </button>

        {purchaseStatus.message && (
          <div className={`purchase-status ${purchaseStatus.type}`}>
            {purchaseStatus.message}
          </div>
        )}

        <div className="gem-details-content">
          <div className="gem-details-left">
            <div className="gem-main-image">
              <img 
                src={gemImages[activeImage]} 
                alt={`${gem.name} - Main View`} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/gem-placeholder.jpg";
                }}
              />
            </div>
            <div className="gem-thumbnails">
              {gemImages.map((img, index) => (
                <div 
                  key={index} 
                  className={`gem-thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`${gem.name} - View ${index + 1}`} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/gem-placeholder.jpg";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="gem-details-right">
            <div className="gem-details-header">
              <div className="gem-category">{gem.type}</div>
              <h1 className="gem-title">
                {gem.name}
                {gem.isVerified && (
                  <span className="verified-badge">
                    <FaCheckCircle /> Verified
                  </span>
                )}
              </h1>
              <div className="gem-rating">
                <div className="stars">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar className="star-inactive" />
                </div>
                <span className="rating-count">(4.0) - 24 Reviews</span>
              </div>
            </div>

            <div className="gem-price-container">
              <div className="gem-price">${gem.price.toFixed(2)}</div>
              <div className="gem-availability">In Stock</div>
            </div>

            <div className="gem-description">
              <h3>Description</h3>
              <p>{gem.description || `This exquisite ${gem.name} is a premium quality ${gem.type} gemstone. With its stunning ${gem.color} color and exceptional clarity, it's perfect for creating unique jewelry pieces or adding to your collection.`}</p>
            </div>

            <div className="gem-specifications">
              <h3>Specifications</h3>
              <div className="spec-grid">
                <div className="spec-item">
                  <div className="spec-icon"><FaGem /></div>
                  <div className="spec-content">
                    <div className="spec-label">Type</div>
                    <div className="spec-value">{gem.type}</div>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><FaWeightHanging /></div>
                  <div className="spec-content">
                    <div className="spec-label">Weight</div>
                    <div className="spec-value">{gem.weight} carats</div>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><div className="color-icon" style={{ backgroundColor: gem.color.toLowerCase() }}></div></div>
                  <div className="spec-content">
                    <div className="spec-label">Color</div>
                    <div className="spec-value">{gem.color}</div>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><FaRuler /></div>
                  <div className="spec-content">
                    <div className="spec-label">Dimensions</div>
                    <div className="spec-value">{gem.dimensions || "8mm x 6mm x 4mm"}</div>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><FaCertificate /></div>
                  <div className="spec-content">
                    <div className="spec-label">Certification</div>
                    <div className="spec-value">{certNumber}</div>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><FaGem /></div>
                  <div className="spec-content">
                    <div className="spec-label">Cut</div>
                    <div className="spec-value">{gem.cut || "Brilliant"}</div>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><FaGem /></div>
                  <div className="spec-content">
                    <div className="spec-label">Seller</div>
                    <div className="spec-value">{gem.sellerName} ({gem.sellerEmail})</div>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><FaCheckCircle /></div>
                  <div className="spec-content">
                    <div className="spec-label">Verification</div>
                    <div className="spec-value">{gem.isVerified ? 'Verified by Admin' : 'Not Verified'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="gem-purchase-options">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="quantity-btn"
                  >-</button>
                  <input 
                    type="number" 
                    id="quantity" 
                    min="1" 
                    value={quantity} 
                    onChange={handleQuantityChange}
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn"
                    disabled
                  >+</button>
                </div>
              </div>

              <div className="purchase-buttons">
                <button className="buy-now-btn" onClick={handleBuyGem}>
                  <FaMoneyBillWave /> Buy Now
                </button>
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  <FaShoppingCart /> Add to Cart
                </button>
                <button className="add-to-wishlist-btn" onClick={handleAddToWishlist}>
                  <FaHeart /> Add to Wishlist
                </button>
                <button className="download-pdf-btn" onClick={downloadGemDetailsAsPDF}>
                  <FaFilePdf /> Download Details
                </button>
              </div>
            </div>

            <div className="gem-share">
              <span>Share this gem:</span>
              <div className="share-buttons">
                <button className="share-btn facebook">
                  <FaShare /> Facebook
                </button>
                <button className="share-btn twitter">
                  <FaShare /> Twitter
                </button>
                <button className="share-btn pinterest">
                  <FaShare /> Pinterest
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="gem-details-tabs">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button 
              className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>
            <button 
              className={`tab-btn ${activeTab === "care" ? "active" : ""}`}
              onClick={() => setActiveTab("care")}
            >
              Care Instructions
            </button>
            <button 
              className={`tab-btn ${activeTab === "shipping" ? "active" : ""}`}
              onClick={() => setActiveTab("shipping")}
            >
              Shipping
            </button>
          </div>
          <div className="tab-content">
            {activeTab === "details" && (
              <div className="tab-pane active">
                <h3>About this {gem.type}</h3>
                <p>
                  This {gem.name} is a premium quality {gem.type} gemstone that has been carefully sourced and authenticated. 
                  Each of our gemstones undergoes rigorous quality control to ensure you receive only the finest specimens.
                </p>
                <p>
                  The {gem.color} color of this {gem.type} is natural and has not been treated or enhanced. 
                  Its exceptional clarity and brilliant cut maximize its natural beauty and light reflection properties.
                </p>
                <p>
                  This gemstone comes with a certificate of authenticity and is ideal for creating custom jewelry pieces 
                  or adding to your gemstone collection.
                </p>
                <h4>Origin</h4>
                <p>
                  This {gem.type} was ethically sourced from {gem.origin || "premium mines in Brazil"}.
                </p>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="tab-pane active">
                <h3>Customer Reviews</h3>
                <p>This product has 24 reviews with an average rating of 4.0 stars.</p>
                <div className="review-list">
                  <div className="review-item">
                    <div className="review-header">
                      <div className="review-stars">
                        <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                      </div>
                      <div className="reviewer-name">John D.</div>
                      <div className="review-date">2 months ago</div>
                    </div>
                    <p className="review-text">
                      Absolutely stunning gemstone! The color is even more vibrant in person.
                    </p>
                  </div>
                  <div className="review-item">
                    <div className="review-header">
                      <div className="review-stars">
                        <FaStar /><FaStar /><FaStar /><FaStar />
                      </div>
                      <div className="reviewer-name">Sarah M.</div>
                      <div className="review-date">1 month ago</div>
                    </div>
                    <p className="review-text">
                      Beautiful gem, exactly as described. Fast shipping too!
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "care" && (
              <div className="tab-pane active">
                <h3>Care Instructions</h3>
                <p>To keep your {gem.type} looking its best:</p>
                <ul>
                  <li>Clean with a soft, lint-free cloth</li>
                  <li>Avoid exposure to harsh chemicals, including perfumes and cleaning products</li>
                  <li>Store separately from other gemstones to prevent scratches</li>
                  <li>Remove before swimming, bathing, or engaging in physical activities</li>
                  <li>Have your gemstone professionally cleaned once a year</li>
                </ul>
              </div>
            )}
            {activeTab === "shipping" && (
              <div className="tab-pane active">
                <h3>Shipping Information</h3>
                <p>All gemstones are carefully packaged and insured for safe delivery.</p>
                <ul>
                  <li><strong>Standard Shipping:</strong> 3-5 business days</li>
                  <li><strong>Express Shipping:</strong> 1-2 business days</li>
                  <li><strong>International Shipping:</strong> 7-14 business days</li>
                </ul>
                <p>All orders over $500 qualify for free shipping. International orders may be subject to customs duties and taxes.</p>
              </div>
            )}
          </div>
        </div>

        {relatedGems.length > 0 && (
          <div className="related-gems-section">
            <h2>You May Also Like</h2>
            <div className="related-gems-grid">
              {relatedGems.map((relatedGem) => (
                <Link to={`/gem/${relatedGem._id}`} className="related-gem-card" key={relatedGem._id}>
                  <div className="related-gem-image">
                    <img 
                      src={`http://localhost:8000${relatedGem.image}`} 
                      alt={relatedGem.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/gem-placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="related-gem-info">
                    <h3>{relatedGem.name}</h3>
                    <div className="related-gem-price">${relatedGem.price.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ViewGemDetails;