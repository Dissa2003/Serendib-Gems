import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from "../../ThemeContext";
import { Link } from "react-router-dom";
import Nav from '../Nav/Nav';
import './RegisteredUsers.css';

function RegisteredUsers() {
  const { theme } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/users');
        setUsers(response.data.Users.filter(user => user.userType)); // Only show public users
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      (user.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.userType?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Clear search input
  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={`app-container ${theme}`}>
      <Nav />
      <div className="page-container">
        <div className="content-wrapper">
          {/* Secondary Navigation Bar */}
          <div className="secondary-nav">
            <Link to="/mainhome" className="secondary-nav-link">Employee Activity</Link>
            <Link to="/userdetails" className="secondary-nav-link">Employee Details</Link>
            <Link to="/registeredusers" className="secondary-nav-link active">User Details</Link>
            <Link to="/reports" className="secondary-nav-link">Employee Reports</Link>
          </div>

          <div className="registered-users-header">
            <div className="header-content">
              <h1 className="page-title">Public User Details</h1>
              <p className="section-description">
                View details of registered public users
              </p>
            </div>
          </div>

          <div className="registered-users-main">
            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={clearSearch}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {/* Users Table */}
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>User Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.firstName || '-'}</td>
                        <td>{user.username || '-'}</td>
                        <td>{user.email || '-'}</td>
                        <td>{user.phoneNumber || '-'}</td>
                        <td>{user.userType || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-users">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisteredUsers;