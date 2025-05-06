// pages/GemCategories.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './footer';
import './css/gemCategories.css';

const GemCategories = () => {
  const gemCategories = [
    {
      id: 1,
      name: "Corundum Family",
      description: "Including the prestigious Ruby and Sapphire varieties, known for their exceptional hardness and brilliance.",
      imageHolder: "/images/134.png", // Placeholder for image
      varieties: ["Ruby", "Blue Sapphire", "Star Ruby", "Star Sapphire", "Fancy Sapphires"],
      isRare: true
    },
    {
      id: 2,
      name: "Chrysoberyl Family",
      description: "Home to the rare color-changing Alexandrite and the mesmerizing Cat's Eye chrysoberyl.",
      imageHolder: "/images/134.png", // Placeholder for image, // Placeholder for image
      varieties: ["Alexandrite", "Cat's Eye"],
      isRare: true
    },
    {
      id: 3,
      name: "Beryl Family",
      description: "Features the serene Aquamarine and other beautiful beryl varieties.",
      imageHolder: "../pages/images/134.png", // Placeholder for image, // Placeholder for image
      varieties: ["Aquamarine", "Morganite", "Golden Beryl"]
    },
    {
      id: 4,
      name: "Spinel",
      description: "Vibrant and diverse, often mistaken historically for corundum gems.",
      imageHolder: "/images/134.png", // Placeholder for image, // Placeholder for image
      varieties: ["Red Spinel", "Blue Spinel", "Pink Spinel", "Purple Spinel"]
    },
    {
      id: 5,
      name: "Garnet Group",
      description: "A diverse family of gems showing a wide range of colors and optical effects.",
      imageHolder: "./images/123.jpeg", // Placeholder for image, // Placeholder for image
      varieties: ["Almandine", "Pyrope", "Spessartine", "Hessonite"]
    },
    {
      id: 6,
      name: "Tourmaline",
      description: "The rainbow gem, offering an incredible spectrum of colors.",
      imageHolder: "/images/gems/tourmaline.jpg", // Placeholder for image
      varieties: ["Pink Tourmaline", "Green Tourmaline", "Watermelon Tourmaline"]
    },
    {
      id: 7,
      name: "Rare and Exotic Gems",
      description: "Exclusive and unique gems, including the legendary Padparadscha Sapphire.",
      imageHolder: "/images/gems/rare-exotic.jpg", // Placeholder for image
      varieties: ["Padparadscha Sapphire", "Sinhalite", "Taaffeite", "Ekanite"],
      isRare: true
    }
  ];

  return (
    <>
      <Navbar />
      <div className="gem-categories">
        <div className="categories-header">
          <h1>Explore Our Gem Collections</h1>
          <p>Discover the finest selection of precious and rare gemstones from Sri Lanka, 
             each with its own unique character and beauty.</p>
        </div>
        
        <div className="gem-grid">
          {gemCategories.map((category) => (
            <div key={category.id} className="gem-category-card">
              {category.isRare && <span className="rare-badge">Rare & Precious</span>}
              <div className="gem-image-container">
                <img 
                  src={category.imageHolder} 
                  alt={category.name}
                  onError={(e) => {
                    e.target.src = './images/addgem1.jpg'; // Fallback image
                  }}
                />
              </div>
              <div className="gem-info">
                <h2>{category.name}</h2>
                <p>{category.description}</p>
                <div className="gem-varieties">
                  {category.varieties.map((variety, index) => (
                    <span key={index} className="gem-variety">{variety}</span>
                  ))}
                </div>
                <Link to={`/gems/${category.id}`} className="view-more-btn">
                  Explore Collection
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GemCategories;
