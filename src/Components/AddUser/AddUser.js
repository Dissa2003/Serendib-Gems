import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Nav/Nav';
import { ThemeContext } from '../../ThemeContext';
import './AddUser.css';

function AddUser() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: 'Employee',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Full name should contain only letters and spaces';
        }
        break;
      case 'username':
        if (!value.trim()) {
          error = 'Username is required';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username should contain only letters, numbers and underscores';
        } else if (value.length < 4) {
          error = 'Username should be at least 4 characters';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phoneNumber':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^\d{10}$/.test(value)) {
          error = 'Phone number must be 10 digits';
        }
        break;
      case 'password':
        if (!value.trim()) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        }
        break;
      case 'confirmPassword':
        if (!value.trim()) {
          error = 'Please confirm your password';
        } else if (value !== inputs.password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setInputs((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Validate field on change
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validateField(name, value),
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};
    
    Object.keys(inputs).forEach((key) => {
      if (key !== 'role') { // Skip role validation
        const error = validateField(key, inputs[key]);
        newErrors[key] = error;
        if (error) valid = false;
      }
    });
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.alert('Please fix the errors in the form before submitting.');
      return;
    }

    try {
      await sendRequest();
      window.alert('User added successfully!');
      navigate('/userdetails');
    } catch (error) {
      console.error('Error adding user:', error);
      let errorMessage = 'Failed to add user. Please try again.';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'Username or email already exists. Please use different credentials.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      window.alert(errorMessage);
    }
  };

  const sendRequest = async () => {
    return await axios.post('http://localhost:8000/users', {
      fullName: String(inputs.fullName),
      username: String(inputs.username),
      email: String(inputs.email),
      phoneNumber: String(inputs.phoneNumber),
      role: String(inputs.role),
      password: String(inputs.password),
      confirmPassword: String(inputs.confirmPassword),
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  return (
    <div className={`add-user-container ${theme}`}>
      <Nav />
      <div className="add-user-content">
        <h1>Add New User</h1>
        <form onSubmit={handleSubmit} className="add-user-form" noValidate>
          <div className="form-sections">
            {/* Left Section */}
            <div className="form-section">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={inputs.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                  required
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={inputs.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.username ? 'input-error' : ''}`}
                  required
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={inputs.role}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Gem Cutter">Gem Cutter</option>
                  <option value="Financial Manager">Financial Manager</option>
                  <option value="Delivery Manager">Delivery Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
            </div>

            {/* Right Section */}
            <div className="form-section">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={inputs.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.phoneNumber ? 'input-error' : ''}`}
                  required
                  maxLength="10"
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={inputs.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  required
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={inputs.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  required
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          <div className="button-container">
            <button type="submit" className={`submit-button ${theme}`}>
              Add User
            </button>
            <button 
              type="button"
              className={`cancel-button ${theme}`}
              onClick={() => navigate('/userdetails')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUser;