// src/components/AdminDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Admin/css/AdminDashboard.css";

function AdminDashboard() {
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();

  const cards = [
    {
      id: "finance",
      title: "Finance",
      icon: "fa-dollar-sign",
      color: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      description: "Manage financial transactions, revenue reports, and accounting",
      actions: [
        { label: "Overview Dashboard", path: "/findash" },
        { label: "View Reports", path: "/financereport" },
        { label: "Manage Settings", path: "/finance-settings" }
      ]
    },
    {
      id: "inventory",
      title: "Gem Inventory",
      icon: "fa-gem",
      color: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
      description: "Track gem stock, specifications, and inventory records",
      actions: [
        { label: "View Inventory", path: "/gemdashboard" },
        { label: "Add New Gems", path: "/add-gems" },
        { label: "Stock Analysis", path: "/stock-analysis" }
      ]
    },
    {
      id: "cutting",
      title: "Gem Cutting",
      icon: "fa-cut",
      color: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      description: "Oversee cutting operations, techniques, and quality control",
      actions: [
        { label: "Cutting Schedule", path: "/cutting-schedule" },
        { label: "Quality Reports", path: "/quality-reports" },
        { label: "Technician Management", path: "/technician-management" }
      ]
    },
    {
      id: "users",
      title: "User Management",
      icon: "fa-users",
      color: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      description: "Handle user roles, permissions, and access control",
      actions: [
        { label: "User List", path: "/user-list" },
        { label: "Role Management", path: "/role-management" },
        { label: "Access Logs", path: "/access-logs" }
      ]
    },
    {
      id: "delivery",
      title: "Delivery Management",
      icon: "fa-truck",
      color: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
      description: "Monitor shipments, tracking, and delivery logistics",
      actions: [
        { label: "Track Shipments", path: "/shippingdisplay" },
        { label: "Delivery Schedule", path: "/delivery-schedule" },
        { label: "Courier Management", path: "/courier-management" } 
      ]
    },
  ];

  const handleCardClick = (id) => {
    setActiveCard(id === activeCard ? null : id);
  };

  const handleActionClick = (path, e) => {
    e.stopPropagation();
    navigate(path);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-gem"></i>
            </div>
            <h1>Serendib Gems</h1>
          </div>
          <div className="user-profile">
            <div className="profile-info">
              <div className="profile-avatar">AD</div>
              <div className="profile-text">
                <h3>Admin Control Center</h3>
                <p>Super Administrator</p>
              </div>
            </div>
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          {cards.map((card) => (
            <div 
              key={card.id}
              className={`dashboard-card ${activeCard === card.id ? 'active' : ''}`}
              onClick={() => handleCardClick(card.id)}
              style={{ background: card.color }}
            >
              <div className="card-content">
                <div className="card-icon">
                  <i className={`fas ${card.icon}`}></i>
                </div>
                <div className="card-text">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </div>
              
              {activeCard === card.id ? (
                <div className="card-actions">
                  {card.actions.map((action, index) => (
                    <button 
                      key={index} 
                      className="action-button"
                      onClick={(e) => handleActionClick(action.path, e)}
                    >
                      {action.label}
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="card-footer">
                  Access {card.title}
                  <i className="fas fa-arrow-right"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;