import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate authentication with a timeout
    setTimeout(() => {
      // Check if credentials match
      if (credentials.email === 'admin@gmail.com' && credentials.password === '1234') {
        // Set admin status in localStorage
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminEmail', credentials.email);
        
        // Redirect to dashboard
        navigate('/admintable');
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <span className="admin-icon">A</span>
          </div>
          <h1>Admin Portal</h1>
          <p>Enter your credentials to access the dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="admin-login-error">{error}</div>}
          
          <div className="admin-form-group">
            <label htmlFor="email">Email</label>
            <div className="admin-input-wrapper">
              <i className="admin-input-icon email-icon"></i>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="admin@gmail.com"
                required
              />
            </div>
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <div className="admin-input-wrapper">
              <i className="admin-input-icon password-icon"></i>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`admin-login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
            {loading && <span className="admin-spinner"></span>}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p>Secure Administrative Access Only</p>
          <p className="admin-copyright">© {new Date().getFullYear()} Admin System</p>
        </div>
      </div>
      
      <style jsx>{`
        .admin-login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1f38 0%, #2d3a5d 100%);
          font-family: 'Poppins', sans-serif;
        }
        
        .admin-login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        
        .admin-login-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          opacity: 0.6;
          z-index: -1;
          animation: pulse 15s infinite;
        }
        
        @keyframes pulse {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-5%, -5%); }
          100% { transform: translate(0, 0); }
        }
        
        .admin-login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .admin-login-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .admin-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #4f79fd 0%, #2250e2 100%);
          border-radius: 50%;
          font-size: 28px;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(33, 79, 226, 0.4);
        }
        
        .admin-login-header h1 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #ffffff, #a3bffa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .admin-login-header p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
        }
        
        .admin-login-form {
          margin-bottom: 1.5rem;
        }
        
        .admin-login-error {
          background-color: rgba(255, 87, 87, 0.2);
          color: #ff5757;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          text-align: center;
          border-left: 3px solid #ff5757;
        }
        
        .admin-form-group {
          margin-bottom: 1.5rem;
        }
        
        .admin-form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .admin-input-wrapper {
          position: relative;
        }
        
        .admin-input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          opacity: 0.7;
        }
        
        .email-icon::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
        }
        
        .password-icon::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
        }
        
        .admin-form-group input {
          width: 100%;
          padding: 1rem 1rem 1rem 45px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .admin-form-group input:focus {
          outline: none;
          border-color: rgba(79, 121, 253, 0.5);
          box-shadow: 0 0 0 3px rgba(79, 121, 253, 0.25);
          background: rgba(255, 255, 255, 0.07);
        }
        
        .admin-form-group input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .admin-login-button {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #4f79fd 0%, #2250e2 100%);
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        
        .admin-login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(33, 79, 226, 0.3);
        }
        
        .admin-login-button:active {
          transform: translateY(0);
        }
        
        .admin-login-button.loading {
          background: linear-gradient(135deg, #3d61c9 0%, #1a3db5 100%);
          pointer-events: none;
        }
        
        .admin-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          margin-left: 10px;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .admin-login-footer {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
        }
        
        .admin-copyright {
          margin-top: 0.5rem;
          font-size: 0.75rem;
        }
        
        /* Responsive adjustments */
        @media (max-width: 480px) {
          .admin-login-card {
            padding: 2rem 1.5rem;
            border-radius: 12px;
            max-width: 90%;
          }
          
          .admin-icon {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }
          
          .admin-login-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;