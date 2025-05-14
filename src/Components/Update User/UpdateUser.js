import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import { ThemeContext } from "../../ThemeContext";
import "./UpdateUser.css";

function UpdateUser() {
  const { theme } = useContext(ThemeContext);
  const [inputs, setInputs] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/users/${id}`);
        if (response.data.user) {
          setInputs(response.data.user);
        } else {
          setError("User not found");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputs.password !== inputs.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.put(`http://localhost:8000/users/${id}`, inputs);
      navigate("/userdetails", { state: { success: "User updated successfully" } });
    } catch (error) {
      setError(error.response?.data?.message || "Error updating user");
    }
  };

  if (loading) {
    return (
      <div className={`update-user-loading ${theme}`}>
        <div className="loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`update-user-error ${theme}`}>
        <p>{error}</p>
        <button onClick={() => navigate("/userdetails")} className="error-back-button">
          Back to User List
        </button>
      </div>
    );
  }

  return (
    <div className={`update-user-container ${theme}`}>
      <Nav />
      
      <main className="update-user-main">
        <div className="update-user-card">
          <header className="update-user-header">
            <h1>Update User Profile</h1>
            <p className="update-user-subtitle">Edit the user details below</p>
          </header>

          <form onSubmit={handleSubmit} className="update-user-form">
            <div className="form-columns">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={inputs.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={inputs.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={inputs.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Gem Cutter">Gem Cutter</option>
                    <option value="Financial Manager">Financial Manager</option>
                    <option value="Delivery Manager">Delivery Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
              </div>

              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={inputs.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    value={inputs.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={inputs.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={inputs.confirmPassword}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button type="button" onClick={() => navigate("/userdetails")} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="submit-button">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default UpdateUser;