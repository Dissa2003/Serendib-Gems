import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./adduser.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [animateForm, setAnimateForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "buyer",
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  useEffect(() => {
    setTimeout(() => setAnimateForm(true), 100);

    const createParticles = () => {
      const particlesContainer = document.querySelector(".sg-particles-container");
      if (!particlesContainer) return;

      for (let i = 0; i < 50; i++) {
        const particle = document.createElement("div");
        particle.classList.add("sg-particle");
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

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!/^[A-Za-z\s]+$/.test(value) && value !== "") {
          return "Name must contain only alphabetical letters";
        }
        return "";
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value !== "") {
          return "Please enter a valid email address";
        }
        return "";
      case "phone":
        if (!/^\d{0,10}$/.test(value) && value !== "") {
          return "Phone number must be up to 10 digits";
        }
        return "";
      case "password":
        if (value.length < 8 && value !== "") {
          return "Password must be at least 8 characters long";
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    setFormData(newFormData);

    // Validate field
    const error = validateField(name, value);
    setFieldErrors({
      ...fieldErrors,
      [name]: error,
    });

    // Check username availability
    if (name === "username" && value) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/users/check-username`,
          { username: value }
        );
        setUsernameAvailable(response.data.available);
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameAvailable(false);
      }
    } else if (name === "username" && !value) {
      setUsernameAvailable(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validate all fields
    const errors = {
      firstName: validateField("firstName", formData.firstName),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      password: validateField("password", formData.password),
    };

    setFieldErrors(errors);

    if (Object.values(errors).some((error) => error !== "")) {
      setFormError("Please fix the errors in the form");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      setFormError("You must agree to the terms and conditions.");
      return;
    }

    if (usernameAvailable === false) {
      setFormError("Username is already taken.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/register`,
        {
          firstName: formData.firstName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          userType: formData.userType,
        }
      );

      toast.success(response.data.message, { position: "top-right" });

      document.querySelector(".sg-register-card").classList.add("success");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          setFormError(error.response.data.message);
        } else {
          setFormError(`Registration failed: ${error.response.status}`);
        }
      } else if (error.request) {
        setFormError("Server not responding. Please try again later.");
      } else {
        setFormError(`Registration failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="serendib-register-page">
      <div className="sg-particles-container"></div>
      <div className="sg-register-content">
        <div className={`sg-register-card ${animateForm ? "visible" : ""}`}>
          <div className="sg-register-card-inner">
            <div className="sg-register-header">
              <div className="sg-logo-container">
                <span className="sg-logo-gem">💎</span>
              </div>
              <h1>Join SerendibGems</h1>
              <p>Create your account to start your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="sg-register-form">
              {formError && (
                <div className="sg-error-message">
                  <i className="sg-error-icon">!</i>
                  {formError}
                </div>
              )}

              <div className="sg-form-row">
                <div className="sg-form-group" style={{ "--i": 1 }}>
                  <div className="sg-input-container">
                    <i className="sg-input-icon">👤</i>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="sg-form-input"
                    />
                    <label htmlFor="firstName" className="sg-floating-label">
                      First Name
                    </label>
                    {fieldErrors.firstName && (
                      <span className="sg-username-status" style={{ color: "red" }}>
                        {fieldErrors.firstName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="sg-form-group" style={{ "--i": 2 }}>
                  <div className="sg-input-container">
                    <i className="sg-input-icon">👤</i>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="sg-form-input"
                    />
                    <label htmlFor="username" className="sg-floating-label">
                      Username
                    </label>
                    {usernameAvailable === true && (
                      <span className="sg-username-status" style={{ color: "green" }}>
                        Username available
                      </span>
                    )}
                    {usernameAvailable === false && (
                      <span className="sg-username-status" style={{ color: "red" }}>
                        Username taken
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="sg-form-group" style={{ "--i": 3 }}>
                <div className="sg-input-container">
                  <i className="sg-input-icon">✉</i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=""
                    required
                    className="sg-form-input"
                  />
                  <label htmlFor="email" className="sg-floating-label">
                    Email Address
                  </label>
                  {fieldErrors.email && (
                    <span className="sg-username-status" style={{ color: "red" }}>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="sg-form-group" style={{ "--i": 4 }}>
                <div className="sg-input-container">
                  <i className="sg-input-icon">📱</i>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder=""
                    required
                    className="sg-form-input"
                  />
                  <label htmlFor="phone" className="sg-floating-label">
                    Phone Number
                  </label>
                  {fieldErrors.phone && (
                    <span className="sg-username-status" style={{ color: "red" }}>
                      {fieldErrors.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="sg-form-row">
                <div className="sg-form-group" style={{ "--i": 5 }}>
                  <div className="sg-input-container">
                    <i className="sg-input-icon">🔒</i>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="sg-form-input"
                    />
                    <label htmlFor="password" className="sg-floating-label">
                      Password
                    </label>
                    {fieldErrors.password && (
                      <span className="sg-username-status" style={{ color: "red" }}>
                        {fieldErrors.password}
                      </span>
                    )}
                  </div>
                </div>

                <div className="sg-form-group" style={{ "--i": 6 }}>
                  <div className="sg-input-container">
                    <i className="sg-input-icon">🔒</i>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="sg-form-input"
                    />
                    <label htmlFor="confirmPassword" className="sg-floating-label">
                      Confirm Password
                    </label>
                  </div>
                </div>
              </div>

              <div className="sg-form-group" style={{ "--i": 7 }}>
                <div className="sg-select-container">
                  <i className="sg-input-icon">👥</i>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="sg-form-select"
                    required
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="both buyer and seller">Buyer and Seller</option>
                  </select>
                  <label htmlFor="userType" className="sg-select-label">
                    I want to join as
                  </label>
                </div>
              </div>

              <div className="sg-form-group sg-terms-group" style={{ "--i": 8 }}>
                <label className="sg-terms-label">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    required
                  />
                  I agree to the{" "}
                  <Link to="#" className="sg-terms-link">
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className={`sg-register-button ${loading ? "loading" : ""}`}
                disabled={
                  loading ||
                  usernameAvailable === false ||
                  Object.values(fieldErrors).some((error) => error !== "")
                }
              >
                {loading ? <span className="sg-spinner"></span> : "Create Account"}
              </button>
            </form>

            <div className="sg-login-prompt">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="sg-login-link">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;