import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Nav from '../Nav/Nav';
import "./Home.css";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/users");
        setUsers(response.data.Users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Filter admin-added users based on search term
  const filteredUsers = users
    .filter((user) => user.fullName || user.role) // Only admin-added users
    .filter(
      (user) =>
        (user.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.role?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

  // Clear search input
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="app-container">
      <Nav />
      <div className="page-container">
        <div className="content-wrapper">
          {/* Secondary Navigation Bar */}
          <div className="secondary-nav">
            <Link to="/mainhome" className="secondary-nav-link active">Employee Activity</Link>
            <Link to="/userdetails" className="secondary-nav-link">Employee Details</Link>
            <Link to="/registeredusers" className="secondary-nav-link">User Details</Link>
            <Link to="/reports" className="secondary-nav-link">Employee Reports</Link>
          </div>

          {/* Header with title and add user button */}
          <div className="section-header">
            <div className="header-content">
              <h1 className="page-title">Employee Activity</h1>
              <p className="section-description">
                Monitor employee activities and performance metrics in real-time
              </p>
            </div>
            <Link to="/adduser" className="add-user-btn">
              <i className="fas fa-plus"></i> Add New User
            </Link>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {/* Enhanced Search Bar with Clear Button */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={clearSearch}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {/* User Table */}
            <div className="user-table">
              <table>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.fullName || '-'}</td>
                        <td>{user.email || '-'}</td>
                        <td>{user.role || '-'}</td>
                        <td>{user.status || "Active"}</td>
                        <td>
                          <Link to={`/userdetails/${user._id}`} className="view-btn">
                            <i className="fas fa-eye"></i> View Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-users">
                        No employees found.
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
};

export default Home;