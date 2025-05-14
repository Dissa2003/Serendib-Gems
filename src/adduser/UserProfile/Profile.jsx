import React from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  return (
    <div className="profile-wrapper">
      <div className="profile-hero-section">
        <h1 className="hero-heading">SerendibGems: Crafting Timeless Elegance</h1>
        <p className="hero-description">
          Embark on a journey through the world’s most exquisite gemstones, where each piece is a testament to nature’s artistry and our dedication to perfection.
        </p>
        <div className="action-buttons">
          <Link to="/login" className="action-button login-action">Login</Link>
          <Link to="/adduserh" className="action-button signup-action">Sign Up</Link>
          <Link to="/admin-login" className="action-button admin-login-action">Admin Login</Link>
        </div>
      </div>

      <section className="profile-main-content">
        <div className="heritage-section">
          <h2 className="section-heading">A Legacy of Gemstone Excellence</h2>
          <p className="section-paragraph">
            SerendibGems stands as a beacon of sophistication in the realm of fine gemstones. Our heritage is rooted in the lush landscapes of Sri Lanka, where we source the rarest sapphires, rubies, and emeralds. Each gem is hand-selected by our expert gemologists, ensuring unparalleled quality and authenticity. We invite you to explore a collection that blends tradition with innovation, crafted for those who seek the extraordinary.
          </p>
        </div>

        <div className="vision-section">
          <h2 className="section-heading">Our Vision for Unmatched Beauty</h2>
          <p className="section-paragraph">
            At SerendibGems, we believe that every gemstone carries a story waiting to be told. Our vision is to create a seamless bridge between nature’s creations and your aspirations. With a commitment to ethical sourcing and bespoke service, we offer a platform where collectors, enthusiasts, and visionaries can discover gems that resonate with their unique sense of style and purpose.
          </p>
        </div>

        <div className="community-section">
          <h2 className="section-heading">Become Part of Our Exclusive Community</h2>
          <p className="section-paragraph">
            Join SerendibGems to unlock a world of rare beauty and expert guidance. As a member, you’ll gain access to our exclusive collections, personalized recommendations, and insights from our gemology experts. Whether you’re new to the world of gemstones or a seasoned connoisseur, our community welcomes you to a journey of discovery. Sign up today or log in to continue your adventure.
          </p>
          <div className="action-buttons secondary-actions">
            <Link to="/login" className="action-button login-action">Access Your Account</Link>
            <Link to="/register" className="action-button signup-action">Join Now</Link>
            <Link to="/admin-login" className="action-button admin-login-action">Admin Access</Link>
          </div>
        </div>
      </section>

      <footer className="profile-footer-section">
        <p>© 2025 SerendibGems. All Rights Reserved.</p>
        <p>Celebrating the Art of Gemstones.</p>
      </footer>
    </div>
  );
};

export default Profile;