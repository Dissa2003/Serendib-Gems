import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaFilter, FaShoppingCart, FaHeart, FaStar, FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer";
import "./css/gemInventory.css";

const GemInventory = () => {
  const [gems, setGems] = useState([]);
  const [filteredGems, setFilteredGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    priceRange: "",
    color: "",
    sortBy: "newest"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchGems = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8000/api/gem");
        console.log("Fetched gems:", response.data);
        setGems(response.data);
        setFilteredGems(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching gems:", err);
        setError("Failed to load gems. Please try again later.");
        setLoading(false);
      }
    };

    fetchGems();
  }, []);

  useEffect(() => {
    let result = [...gems];

    if (searchTerm) {
      result = result.filter(
        gem =>
          gem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gem.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.type) {
      result = result.filter(gem => gem.type === filters.type);
    }

    if (filters.color) {
      result = result.filter(gem => gem.color === filters.color);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      result = result.filter(gem => gem.price >= min && gem.price <= (max || Infinity));
    }

    switch (filters.sortBy) {
      case "priceAsc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "nameAsc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredGems(result);
  }, [searchTerm, filters, gems]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      priceRange: "",
      color: "",
      sortBy: "newest"
    });
    setSearchTerm("");
  };

  const handleBuyGem = async (gemId, gemName) => {
    try {
      console.log(`Purchasing gem with ID: ${gemId}`);
      setPurchaseStatus({
        message: `Successfully purchased ${gemName}!`,
        type: "success"
      });
      
      setTimeout(() => {
        setPurchaseStatus({ message: "", type: "" });
      }, 3000);
    } catch (err) {
      console.error("Error purchasing gem:", err);
      setPurchaseStatus({
        message: `Failed to purchase ${gemName}. Please try again.`,
        type: "error"
      });
      
      setTimeout(() => {
        setPurchaseStatus({ message: "", type: "" });
      }, 3000);
    }
  };

  const gemTypes = [...new Set(gems.map(gem => gem.type))];
  const gemColors = [...new Set(gems.map(gem => gem.color))];

  return (
    <>
      <Navbar />
      <div className="gem-inventory-container">
        <div className="inventory-header">
          <h1>Gem Collection</h1>
          <p>Discover our exquisite selection of premium gemstones</p>
          <Link to="/add-gem" className="add-gem-btn">Add New Gem</Link>
        </div>

        {purchaseStatus.message && (
          <div className={`purchase-status ${purchaseStatus.type}`}>
            {purchaseStatus.message}
          </div>
        )}

        <div className="search-filter-container">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search gems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="filter-toggle" onClick={toggleFilters}>
            <FaFilter /> Filters
          </button>
        </div>

        <div className={`filters-panel ${showFilters ? 'show' : ''}`}>
          <div className="filter-group">
            <label>Gem Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              {gemTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Color</label>
            <select name="color" value={filters.color} onChange={handleFilterChange}>
              <option value="">All Colors</option>
              {gemColors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange}>
              <option value="">All Prices</option>
              <option value="0-100">$0 - $100</option>
              <option value="100-500">$100 - $500</option>
              <option value="500-1000">$500 - $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="5000-">$5,000+</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
              <option value="newest">Newest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="nameAsc">Name: A to Z</option>
            </select>
          </div>

          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading exquisite gems...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="results-info">
              <p>Showing {filteredGems.length} gems</p>
            </div>

            <div className="gems-grid">
              {filteredGems.length > 0 ? (
                filteredGems.map((gem) => (
                  <div className="gem-card" key={gem._id}>
                    <div className="gem-card-inner">
                      <div className="gem-image">
                        <img 
                          src={`http://localhost:8000${gem.image}`} 
                          alt={gem.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/gem-placeholder.jpg";
                          }}
                        />
                        <div className="gem-actions">
                          <button className="action-btn wishlist-btn" title="Add to Wishlist">
                            <FaHeart />
                          </button>
                          <button className="action-btn cart-btn" title="Add to Cart">
                            <FaShoppingCart />
                          </button>
                        </div>
                      </div>
                      <div className="gem-info">
                        <div className="gem-type">{gem.type}</div>
                        <h3 className="gem-name">
                          {gem.name}
                          {gem.isVerified && (
                            <span className="verified-badge">
                              <FaCheckCircle /> Verified
                            </span>
                          )}
                        </h3>
                        <div className="gem-rating">
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar className="star-inactive" />
                          <span>(4.0)</span>
                        </div>
                        <div className="gem-details">
                          <span className="gem-weight">{gem.weight} carats</span>
                          <span className="gem-color" style={{ backgroundColor: gem.color.toLowerCase() }}></span>
                        </div>
                        <div className="gem-price">${gem.price.toFixed(2)}</div>
                        <div className="gem-buttons">
                          <Link to={`/gem/${gem._id}`} className="view-details-btn">
                            View Details
                          </Link>
                          <button 
                            className="buy-now-btn"
                            onClick={() => handleBuyGem(gem._id, gem.name)}
                          >
                            <FaMoneyBillWave /> Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <h3>No gems found</h3>
                  <p>Try adjusting your filters or search term</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default GemInventory;