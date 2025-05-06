import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFilePdf, FaSearch, FaFilter, FaPlusCircle } from "react-icons/fa";
import { jsPDF } from "jspdf";
import axios from "axios";
import './css/gemdashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import logo from '../assets/serendib-gems-logo.jpeg';

function GemAdminDashboard() {
  const [gems, setGems] = useState([]);
  const [filteredGems, setFilteredGems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGem, setSelectedGem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteGemId, setDeleteGemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    color: "",
    priceRange: "",
    verified: "",
    sortBy: "newest"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [lowStockGems, setLowStockGems] = useState([]);

  useEffect(() => {
    fetchGems();
  }, []);

  const fetchGems = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/gem/");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setGems(data);
      setFilteredGems(data);
      // Check for low stock gems (assuming stock is a field in gem data)
      const lowStock = data.filter(gem => gem.stock < 5 && gem.stock >= 0);
      setLowStockGems(lowStock);
    } catch (err) {
      setError("Failed to fetch gems. Please try again later.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...gems];

    if (searchTerm) {
      result = result.filter(
        gem =>
          gem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gem.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gem.description.toLowerCase().includes(searchTerm.toLowerCase())
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

    if (filters.verified) {
      const isVerified = filters.verified === "verified";
      result = result.filter(gem => gem.isVerified === isVerified);
    }

    switch (filters.sortBy) {
      case "priceAsc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result.sort((a, b) => b.price - b.price);
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

  useEffect(() => {
    // Display alert for low stock gems
    if (lowStockGems.length > 0) {
      const gemNames = lowStockGems.map(gem => gem.name).join(", ");
      alert(`Low stock warning: The following gems have stock below 5: ${gemNames}`);
    }
  }, [lowStockGems]);

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
      color: "",
      priceRange: "",
      verified: "",
      sortBy: "newest"
    });
    setSearchTerm("");
  };

  const handleDeleteClick = (gemId) => {
    setDeleteGemId(gemId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/gem/${deleteGemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete gem");
      }

      setGems(gems.filter(gem => gem._id !== deleteGemId));
      setFilteredGems(filteredGems.filter(gem => gem._id !== deleteGemId));
      setShowDeleteConfirm(false);
      setDeleteGemId(null);

      if (selectedGem && selectedGem._id === deleteGemId) {
        setSelectedGem(null);
      }
      // Update low stock gems after deletion
      setLowStockGems(lowStockGems.filter(gem => gem._id !== deleteGemId));
    } catch (err) {
      setError(err.message || "Failed to delete gem. Please try again.");
      console.error("Delete error:", err);
      setTimeout(() => setError(null), 5000);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteGemId(null);
  };

  const handleToggleVerification = async (gemId) => {
    try {
      const response = await axios.patch(`http://localhost:8000/api/gem/${gemId}/verify`);
      if (response.status === 200) {
        setGems(gems.map(gem => 
          gem._id === gemId ? { ...gem, isVerified: response.data.gem.isVerified } : gem
        ));
        setFilteredGems(filteredGems.map(gem => 
          gem._id === gemId ? { ...gem, isVerified: response.data.gem.isVerified } : gem
        ));
        if (selectedGem && selectedGem._id === gemId) {
          setSelectedGem({ ...selectedGem, isVerified: response.data.gem.isVerified });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle verification status. Please try again.");
      console.error("Verification error:", err);
      setTimeout(() => setError(null), 5000);
    }
  };

  const openGemDetails = (gem) => {
    setSelectedGem(gem);
  };

  const closeGemDetails = () => {
    setSelectedGem(null);
  };

  const downloadGemDetailsAsPDF = (gem) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${gem.name} Details`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Type: ${gem.type}`, 10, 20);
    doc.text(`Weight: ${gem.weight} carats`, 10, 30);
    doc.text(`Color: ${gem.color}`, 10, 40);
    doc.text(`Price: $${gem.price.toFixed(2)}`, 10, 50);
    doc.text(`Stock: ${gem.stock}`, 10, 60);
    doc.text(`Seller: ${gem.sellerName} (${gem.sellerEmail})`, 10, 70);
    doc.text(`Verified: ${gem.isVerified ? 'Yes' : 'No'}`, 10, 80);
    doc.text(`Description:`, 10, 90);
    const descriptionLines = doc.splitTextToSize(gem.description, 180);
    doc.text(descriptionLines, 10, 100);
    doc.save(`${gem.name}_Details.pdf`);
  };

  const downloadGemsAsPDF = (gemsToDownload, title, filename) => {
    const doc = new jsPDF();
    let yOffset = 10;

    doc.setFontSize(16);
    doc.text(title, 10, yOffset);
    yOffset += 10;

    gemsToDownload.forEach((gem, index) => {
      if (yOffset > 270) {
        doc.addPage();
        yOffset = 10;
      }

      doc.setFontSize(12);
      doc.text(`Gem ${index + 1}: ${gem.name}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Type: ${gem.type}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Weight: ${gem.weight} carats`, 10, yOffset);
      yOffset += 10;
      doc.text(`Color: ${gem.color}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Price: $${gem.price.toFixed(2)}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Stock: ${gem.stock}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Seller: ${gem.sellerName} (${gem.sellerEmail})`, 10, yOffset);
      yOffset += 10;
      doc.text(`Verified: ${gem.isVerified ? 'Yes' : 'No'}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Description:`, 10, yOffset);
      yOffset += 10;
      const descriptionLines = doc.splitTextToSize(gem.description, 180);
      doc.text(descriptionLines, 10, yOffset);
      yOffset += descriptionLines.length * 10 + 10;
    });

    doc.save(filename);
  };

  const totalGems = filteredGems.length;
  const totalValue = filteredGems.reduce((sum, gem) => sum + gem.price, 0).toFixed(2);
  const gemTypes = [...new Set(filteredGems.map(gem => gem.type))].length;
  const gemTypesList = [...new Set(gems.map(gem => gem.type))];
  const gemColors = [...new Set(gems.map(gem => gem.color))];

  return (
    <div className="gem-adm-container">
      <div className="gem-adm-content">
        <nav className="gem-adm-sidebar">
          <div className="gem-adm-sidebar-header">
            <div className="gem-adm-logo">
              <img src={logo} alt="Serendib Gems" className="gem-adm-logo-image" />
              <div className="gem-adm-logo-text">Serendib Gems</div>
            </div>
          </div>
          <ul className="gem-adm-nav-items">
            <li className="gem-adm-nav-item">
              <Link to="/dashboard" className="gem-adm-nav-link">
                <i className="fas fa-chart-line"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="gem-adm-nav-item">
              <Link to="/users" className="gem-adm-nav-link">
                <i className="fas fa-users"></i>
                <span>User Management</span>
              </Link>
            </li>
            <li className="gem-adm-nav-item">
              <Link to="/gemdashboard" className="gem-adm-nav-link active">
                <i className="fas fa-boxes"></i>
                <span>Inventory Management</span>
              </Link>
            </li>
            <li className="gem-adm-nav-item">
              <Link to="/financereport" className="gem-adm-nav-link">
                <i className="fas fa-dollar-sign"></i>
                <span>Financial Management</span>
              </Link>
            </li>
            <li className="gem-adm-nav-item">
              <Link to="/cutting" className="gem-adm-nav-link">
                <i className="fas fa-cut"></i>
                <span>Gem Cutting</span>
              </Link>
            </li>
            <li className="gem-adm-nav-item">
              <Link to="/delivery" className="gem-adm-nav-link">
                <i className="fas fa-truck"></i>
                <span>Delivery Management</span>
              </Link>
            </li>
          </ul>
        </nav>

        <main className="gem-adm-main-content">
          <div className="gem-adm-top-bar">
            <h1 className="gem-adm-page-title">Gem Admin Dashboard</h1>
          </div>

          <div className="gem-adm-gem-stats">
            <div className="gem-adm-stat-card">
              <h3>Total Gems</h3>
              <p>{totalGems}</p>
            </div>
            <div className="gem-adm-stat-card">
              <h3>Total Value</h3>
              <p>${totalValue}</p>
            </div>
            <div className="gem-adm-stat-card">
              <h3>Gem Types</h3>
              <p>{gemTypes}</p>
            </div>
          </div>

          <div className="gem-adm-search-filter-container">
            <div className="gem-adm-search-bar">
              <FaSearch className="gem-adm-search-icon" />
              <input
                type="text"
                placeholder="Search gems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="gem-adm-filter-toggle" onClick={toggleFilters}>
              <FaFilter /> Filters
            </button>

            <Link to="/addgembyadmin" className="gem-adm-add-gem-btn">
              <FaPlusCircle /> Add New Gem
            </Link>
          </div>

          <div className={`gem-adm-filters-panel ${showFilters ? 'show' : ''}`}>
            <div className="gem-adm-filter-group">
              <label>Gem Type</label>
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                {gemTypesList.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="gem-adm-filter-group">
              <label>Color</label>
              <select name="color" value={filters.color} onChange={handleFilterChange}>
                <option value="">All Colors</option>
                {gemColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div className="gem-adm-filter-group">
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

            <div className="gem-adm-filter-group">
              <label>Verified Status</label>
              <select name="verified" value={filters.verified} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            <div className="gem-adm-filter-group">
              <label>Sort By</label>
              <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                <option value="newest">Newest First</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="nameAsc">Name: A to Z</option>
              </select>
            </div>

            <button className="gem-adm-clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

          {error && <div className="gem-adm-error-container">{error}</div>}

          {loading ? (
            <div className="gem-adm-loading-container">Loading gems...</div>
          ) : (
            <div className="gem-adm-gem-table-container">
              <div className="gem-adm-results-info">
                <p>Showing {filteredGems.length} gems</p>
                <div className="gem-adm-download-buttons">
                  <button 
                    className="gem-adm-download-all-pdf-btn" 
                    onClick={() => downloadGemsAsPDF(gems, "All Gems Inventory", "All_Gems_Inventory.pdf")}
                  >
                    <FaFilePdf /> Download All Gems
                  </button>
                  <button 
                    className="gem-adm-download-filtered-pdf-btn" 
                    onClick={() => downloadGemsAsPDF(filteredGems, "Filtered Gems Inventory", "Filtered_Gems_Inventory.pdf")}
                    disabled={filteredGems.length === 0}
                  >
                    <FaFilePdf /> Download Filtered Gems
                  </button>
                </div>
              </div>
              <table className="gem-adm-gem-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Color</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGems.map((gem) => (
                    <tr key={gem._id} className={gem.stock < 5 ? 'gem-adm-low-stock' : ''}>
                      <td>
                        <div className="gem-adm-gem-image-container">
                          <img
                            src={`http://localhost:8000${gem.image}`}
                            alt={gem.name}
                            className="gem-adm-gem-thumbnail"
                          />
                        </div>
                      </td>
                      <td>{gem.name}</td>
                      <td>{gem.type}</td>
                      <td>
                        <span
                          className="gem-adm-color-preview"
                          style={{ backgroundColor: gem.color }}
                        ></span>
                        {gem.color}
                      </td>
                      <td>${gem.price.toFixed(2)}</td>
                      <td>{gem.stock}</td>
                      <td>{gem.isVerified ? 'Yes' : 'No'}</td>
                      <td>
                        <button
                          className="gem-adm-view-details-btn"
                          onClick={() => openGemDetails(gem)}
                        >
                          View Details
                        </button>
                        <button
                          className="gem-adm-verify-btn"
                          onClick={() => handleToggleVerification(gem._id)}
                        >
                          {gem.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          className="gem-adm-download-pdf-btn"
                          onClick={() => downloadGemDetailsAsPDF(gem)}
                        >
                          <FaFilePdf /> Download
                        </button>
                        <button
                          className="gem-adm-delete-btn"
                          onClick={() => handleDeleteClick(gem._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredGems.length === 0 && (
                <div className="gem-adm-no-results">
                  <h3>No gems found</h3>
                  <p>Try adjusting your filters or search term</p>
                </div>
              )}
            </div>
          )}

          {selectedGem && (
            <div className="gem-adm-gem-modal-overlay">
              <div className="gem-adm-gem-modal">
                <button className="gem-adm-close-modal" onClick={closeGemDetails}>×</button>
                <div className="gem-adm-gem-modal-content">
                  <div className="gem-adm-gem-modal-image">
                    <img
                      src={`http://localhost:8000${selectedGem.image}`}
                      alt={selectedGem.name}
                    />
                  </div>
                  <div className="gem-adm-gem-modal-details">
                    <h2>{selectedGem.name}</h2>

                    <div className="gem-adm-gem-detail">
                      <span className="gem-adm-detail-label">Type:</span>
                      <span className="gem-adm-detail-value">{selectedGem.type}</span>
                    </div>

                    <div className="gem-adm-gem-detail">
                      <span className="gem-adm-detail-label">Color:</span>
                      <span className="gem-adm-detail-value">
                        <span
                          className="gem-adm-color-preview-large"
                          style={{ backgroundColor: selectedGem.color }}
                        ></span>
                        {selectedGem.color}
                      </span>
                    </div>

                    <div className="gem-adm-gem-detail">
                      <span className="gem-adm-detail-label">Weight:</span>
                      <span className="gem-adm-detail-value">{selectedGem.weight} carats</span>
                    </div>

                    <div className="gem-adm-gem-detail">
                      <span className="gem-adm-detail-label">Price:</span>
                      <span className="gem-adm-detail-value">${selectedGem.price.toFixed(2)}</span>
                    </div>

                    <div className="gem-adm-gem-detail">
                      <span className="gem-adm-detail-label">Stock:</span>
                      <span className="gem-adm-detail-value">{selectedGem.stock}</span>
                    </div>

                    <div className="gem-adm-gem-detail">
                      <span className="gem-adm-detail-label">Seller:</span>
                      <span className="gem-adm-detail-value">{selectedGem.sellerName} ({selectedGem.sellerEmail})</span>
                    </div>

                    <div className="gem-adm-gem-detail">
                      <span className="gem-adm-detail-label">Verified:</span>
                      <span className="gem-adm-detail-value">{selectedGem.isVerified ? 'Yes' : 'No'}</span>
                    </div>

                    <div className="gem-adm-gem-detail gem-adm-description">
                      <span className="gem-adm-detail-label">Description:</span>
                      <span className="gem-adm-detail-value">{selectedGem.description}</span>
                    </div>
                  </div>
                </div>
                <div className="gem-adm-gem-modal-actions">
                  <button
                    className="gem-adm-verify-btn"
                    onClick={() => handleToggleVerification(selectedGem._id)}
                  >
                    {selectedGem.isVerified ? 'Unverify Gem' : 'Verify Gem'}
                  </button>
                  <button
                    className="gem-adm-download-pdf-btn"
                    onClick={() => downloadGemDetailsAsPDF(selectedGem)}
                  >
                    <FaFilePdf /> Download Details
                  </button>
                  <button
                    className="gem-adm-delete-btn"
                    onClick={() => handleDeleteClick(selectedGem._id)}
                  >
                    Delete Gem
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="gem-adm-delete-confirm-modal">
              <div className="gem-adm-delete-confirm-content">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete this gem? This action cannot be undone.</p>
                <div className="gem-adm-delete-confirm-actions">
                  <button className="gem-adm-cancel-btn" onClick={cancelDelete}>
                    Cancel
                  </button>
                  <button className="gem-adm-confirm-delete-btn" onClick={confirmDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default GemAdminDashboard;