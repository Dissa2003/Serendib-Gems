import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../../ThemeContext";
import "./User.css";
import Nav from '../Nav/Nav';

function User() {
  const { theme } = useContext(ThemeContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/users/${id}`);
        if (response.data.user) {
          setUser(response.data.user);
        } else {
          setError("User not found");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const deleteHandler = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8000/users/${id}`);
        navigate("/userdetails", { state: { success: "User deleted successfully" } });
      } catch (error) {
        console.error("Error deleting user:", error.response ? error.response.data : error.message);
        setError("Failed to delete user: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleSendReport = () => {
    const phoneNumber = user?.phoneNumber;
    if (phoneNumber) {
      const message = "Hello, I am sending you a report";
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    } else {
      setError("Phone number not available");
    }
  };

  if (loading) {
    return (
      <div className={`user-loading ${theme}`}>
        <div className="loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`user-error ${theme}`}>
        <p className="error-message">{error}</p>
        <button 
          onClick={() => navigate("/userdetails")} 
          className="back-button"
        >
          Back to User List
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`user-container ${theme}`}>
      <Nav />
      
      <main className="user-main">
        <div className="user-card">
          <div className="user-profile">
            <div className="profile-header">
              <div className="profile-photo">{user.fullName.charAt(0)}</div>
              <h1>{user.fullName}</h1>
              <p className="user-email">{user.email}</p>
              <span className={`role-badge ${theme}`}>{user.role}</span>
            </div>

            <div className="user-details">
              
              <div className="detail-item">
                <span className="detail-label">Username:</span>
                <span className="detail-value">{user.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{user.phoneNumber}</span>
              </div>
            </div>

            <div className="user-actions">
              <Link 
                to={`/userdetails/${user._id}/update`} 
                className={`action-btn update-btn ${theme}`}
              >
                Update Profile
              </Link>
              <button 
                onClick={deleteHandler} 
                className={`action-btn delete-btn ${theme}`}
              >
                Delete User
              </button>
            </div>
          </div>

          <div className="user-activity">
            <div className="activity-section">
              <h2 className="section-title">Recent Activity</h2>
              <ul className="activity-list">
                <li className="activity-item">Logged in on 2023-10-15</li>
                <li className="activity-item">Updated profile on 2023-10-14</li>
                <li className="activity-item">Completed task "Report Generation"</li>
              </ul>
            </div>

            <div className="stats-section">
              <h2 className="section-title">User Statistics</h2>
              <div className="stats-grid">
                <div className={`stat-card ${theme}`}>
                  <h3>Total Logins</h3>
                  <p className="stat-value">42</p>
                </div>
                <div className={`stat-card ${theme}`}>
                  <h3>Tasks Completed</h3>
                  <p className="stat-value">15</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSendReport} 
              className={`whatsapp-btn ${theme}`}
            >
              <span className="icon">💬</span> Send WhatsApp Message
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default User;