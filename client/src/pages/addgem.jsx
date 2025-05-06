import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer";
import "./css/addGem.css";

const AddGem = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    weight: "",
    color: "",
    price: "",
    description: "",
    image: null,
    sellerName: "",
    sellerEmail: ""
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // List of common gem types for the dropdown
  const gemTypes = [
    "Diamond",
    "Ruby",
    "Sapphire",
    "Emerald",
    "Amethyst",
    "Topaz",
    "Garnet",
    "Opal",
    "Aquamarine",
    "Tourmaline",
    "Other"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for weight and price
    if (name === "weight" || name === "price") {
      if (value === "" || parseFloat(value) >= 0) {
        setFormData({ ...formData, [name]: value });
      }
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check all required fields
    if (!formData.name || !formData.type || !formData.weight || !formData.color || 
        !formData.price || !formData.description || !formData.image || 
        !formData.sellerName || !formData.sellerEmail) {
      toast.error("All fields are required!", { position: "top-right" });
      return;
    }

    // Additional validation for weight and price
    if (parseFloat(formData.weight) <= 0) {
      toast.error("Weight must be greater than 0!", { position: "top-right" });
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error("Price must be greater than 0!", { position: "top-right" });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.sellerEmail)) {
      toast.error("Please enter a valid email address!", { position: "top-right" });
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('type', formData.type);
      formDataToSubmit.append('weight', formData.weight);
      formDataToSubmit.append('color', formData.color);
      formDataToSubmit.append('price', formData.price);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('image', formData.image);
      formDataToSubmit.append('sellerName', formData.sellerName);
      formDataToSubmit.append('sellerEmail', formData.sellerEmail);

      const response = await axios.post('http://localhost:8000/api/gem/add', formDataToSubmit, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message, { position: "top-right" });
      navigate("/geminven");
    } catch (error) {
      console.error("Error adding gem:", error);
      toast.error("Gem addition failed. Please try again.", { position: "top-right" });
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-gem-container">
        <div className="header">
          <Link to="/gems" className="back-btn">
            <FaArrowLeft /> Back to Gem List
          </Link>
          <h1>Add New Gem</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="gem-form">
          <div className="form-grid">
            <div className="form-left">
              <div className="form-group">
                <label htmlFor="name">Gem Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter gem name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gem type</option>
                  {gemTypes.map((gemType) => (
                    <option key={gemType} value={gemType}>
                      {gemType}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="weight">Weight (carats)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  placeholder="Enter weight in carats"
                  step="0.01"
                  min="0.01"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  placeholder="Enter gem color"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="Enter price"
                  step="0.01"
                  min="0.01"
                />
              </div>
            </div>
            
            <div className="form-right">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Enter gem description"
                  rows="5"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="image">Upload Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="file-input"
                />
                
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="sellerName">Seller Name</label>
                <input
                  type="text"
                  id="sellerName"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleChange}
                  required
                  placeholder="Enter seller name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="sellerEmail">Seller Email</label>
                <input
                  type="email"
                  id="sellerEmail"
                  name="sellerEmail"
                  value={formData.sellerEmail}
                  onChange={handleChange}
                  required
                  placeholder="Enter seller email"
                />
              </div>
            </div>
          </div>
          
          <button type="submit" className="submit-btn">Add Gem</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AddGem;