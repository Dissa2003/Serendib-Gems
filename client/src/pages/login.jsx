import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer";
import "./css/login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [animateForm, setAnimateForm] = useState(false);

  useEffect(() => {
    console.log("API URL:", process.env.REACT_APP_API_URL); // Debug
    setTimeout(() => setAnimateForm(true), 100);

    const createParticles = () => {
      const particlesContainer = document.querySelector(".particles-container");
      if (!particlesContainer) return;

      for (let i = 0; i < 50; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.width = `${Math.random() * 10 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particlesContainer.appendChild(particle);
      }
    };

    createParticles();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        { email, password }
      );

      const { user, token } = response.data;

      // Success animation
      document.querySelector(".login-card").classList.add("success");

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setTimeout(() => {
        // Redirect based on user type
        if (user.userType === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setFormError(error.response.data.message);
      } else {
        setFormError("Login failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar />

      <div className="particles-container"></div>

      <div className="login-content">
        <div className={`login-card ${animateForm ? "visible" : ""}`}>
          <div className="login-card-inner">
            <div className="login-header">
              <h1>Welcome Back</h1>
              <p>Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              {formError && (
                <div className="error-message">
                  <i className="error-icon">!</i>
                  {formError}
                </div>
              )}

              <div className="form-group">
                <div className="input-container">
                  <i className="input-icon email-icon">✉</i>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="form-input"
                  />
                  <label htmlFor="email" className="floating-label">Email Address</label>
                </div>
              </div>

              <div className="form-group">
                <div className="input-container">
                  <i className="input-icon password-icon">🔒</i>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="form-input"
                  />
                  <label htmlFor="password" className="floating-label">Password</label>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
              </div>

              <button
                type="submit"
                className={`login-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? <span className="spinner"></span> : "Sign In"}
              </button>
            </form>

            <div className="social-login">
              <p>Or sign in with</p>
              <div className="social-buttons">
                <button className="social-btn google">
                  <i className="social-icon">G</i>
                </button>
                <button className="social-btn facebook">
                  <i className="social-icon">f</i>
                </button>
                <button className="social-btn twitter">
                  <i className="social-icon">t</i>
                </button>
              </div>
            </div>

            <div className="signup-prompt">
              <p>
                Don't have an account? <Link to="/register" className="signup-link">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}