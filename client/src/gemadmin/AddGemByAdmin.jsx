import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from '../Admin/Navbar';
import axios from "axios";
import './css/addGemByAdmin.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function AddGemByAdmin() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    weight: "",
    color: "",
    price: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Client-side validation
    if (!formData.name || !formData.type || !formData.weight || !formData.color || !formData.price || !formData.description) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    if (!image) {
      setError("An image is required.");
      setLoading(false);
      return;
    }
    if (isNaN(formData.weight) || formData.weight <= 0) {
      setError("Weight must be a positive number.");
      setLoading(false);
      return;
    }
    if (isNaN(formData.price) || formData.price <= 0) {
      setError("Price must be a positive number.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("type", formData.type);
    data.append("weight", formData.weight);
    data.append("color", formData.color);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("image", image);
    data.append("sellerName", "Serendib Gems");
    data.append("sellerEmail", "SrenedibGems@gmail.com");
    data.append("isVerified", true);

    try {
      const response = await axios.post("http://localhost:8000/api/gem/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(response.data.message);
      setFormData({ name: "", type: "", weight: "", color: "", price: "", description: "" });
      setImage(null);
      setTimeout(() => navigate("/gemdashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.errorMessage || "Failed to add gem. Please try again.");
      console.error("Add gem error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <i className="fas fa-gem"></i>
            </div>
            <div className="logo-text">GemSystem</div>
          </div>
        </div>

        <ul className="nav-items">
          <li className="nav-item">
            <Link to="/dashboard" className="nav-link">
              <i className="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/users" className="nav-link">
              <i className="fas fa-users"></i>
              <span>User Management</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/gemdashboard" className="nav-link">
              <i className="fas fa-boxes"></i>
              <span>Inventory Management</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/addgem" className="nav-link active">
              <i className="fas fa-plus-circle"></i>
              <span>Add Gem</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/financereport" className="nav-link">
              <i className="fas fa-dollar-sign"></i>
              <span>Financial Management</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/cutting" className="nav-link">
              <i className="fas fa-cut"></i>
              <span>Gem Cutting</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/delivery" className="nav-link">
              <i className="fas fa-truck"></i>
              <span>Delivery Management</span>
            </Link>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        <Nav />

        <div className="top-bar">
          <h1 className="page-title">Add New Gem</h1>
        </div>

        <div className="add-gem-container">
          <form onSubmit={handleSubmit} className="add-gem-form">
            <div className="form-group">
              <label htmlFor="name">Gem Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter gem name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select gem type</option>
                <option value="Ruby">Ruby</option>
                <option value="Sapphire">Sapphire</option>
                <option value="Emerald">Emerald</option>
                <option value="Diamond">Diamond</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (carats)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="Enter weight in carats"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Enter color (e.g., Red, Blue)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (USD)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price in USD"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter gem description"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="image">Image</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Seller</label>
              <p className="fixed-field">Serendib Gems (SrenedibGems@gmail.com)</p>
            </div>

            <div className="form-group">
              <label>Verified Status</label>
              <p className="fixed-field">Verified</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Adding Gem..." : "Add Gem"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddGemByAdmin;