import React from 'react';
import { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Lock } from 'lucide-react';
import './css/welcome.css';

export default function Welcome() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="welcome-container">
      {/* Background floating gems */}
      <div className="gem-background">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i}
            className="floating-gem"
            style={{
              width: `${Math.random() * 15 + 5}px`,
              height: `${Math.random() * 15 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 12 + 10}s`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner-container">
              <div className="spinner"></div>
              <Sparkles className="spinner-icon" size={36} />
            </div>
            <p className="loading-text">Unveiling Treasures...</p>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="main-container">
        <header className="welcome-header">
          <div className="logo-container">
            <Sparkles className="sparkle-icon" size={32} />
            <h1 className="site-title">SERENDIB GEMS</h1>
            <Sparkles className="sparkle-icon" size={32} />
          </div>
          <p className="site-tagline">Where Legends Shine</p>
        </header>
        
        <div className="content-wrapper">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Discover Serendib Gem Market</h2>
              <p className="card-subtitle">Bridging nature's brilliance with timeless trade</p>
            </div>
            
            <div className="button-container">
              <button 
                className="login-button"
                onClick={() => window.location.href = '/login'}
              >
                Login
                <ChevronRight className="button-icon" size={20} />
              </button>
              
              <button 
                className="signup-button"
                onClick={() => window.location.href = '/add'}
              >
                Sign Up
                <ChevronRight className="button-icon" size={20} />
              </button>
            </div>
          </div>
          
          <div className="description">
            <p className="description-text">
              Experience Sri Lanka's legendary gem-trading heritage through our transparent, 
              elegant, and culturally rich platform.
            </p>
          </div>
        </div>
        
        <footer className="welcome-footer">
          <div className="footer-content">
            <div className="copyright">© 2025 Serendib Gems. All rights reserved.</div>
            <div className="admin-login">
              <button 
                className="admin-button"
                onClick={() => window.location.href = '/adminlogin'}
              >
                <Lock size={12} className="admin-icon" />
                Admin Portal
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}