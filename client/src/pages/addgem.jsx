import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Button from "../components/ui/button";
import Navbar from "./Navbar"; 
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Gem Data:", formData);
  };

  return (

    
    <div className="add-gem-container">
         <Navbar /> {/* Include the Navbar */}
      <header className="header">
        <Link to="/" className="back-btn">
          <FaArrowLeft /> Back
        </Link>
        <h1>Add New Gem</h1>
      </header>

      <form onSubmit={handleSubmit} className="gem-form">
        <label>Gem Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Type:</label>
        <input type="text" name="type" value={formData.type} onChange={handleChange} required />

        <label>Weight (carats):</label>
        <input type="number" name="weight" value={formData.weight} onChange={handleChange} required />

        <label>Color:</label>
        <input type="text" name="color" value={formData.color} onChange={handleChange} required />

        <label>Price ($):</label>
        <input type="number" name="price" value={formData.price} onChange={handleChange} required />

        <label>Description:</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required />

        <label>Upload Image:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />

        <Button type="submit" className="submit-btn">Add Gem</Button>
      </form>
    </div>
  );
};

export default AddGem;