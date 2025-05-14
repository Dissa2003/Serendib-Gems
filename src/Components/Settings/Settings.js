import React from "react";
import ThemeToggle from "../ThemeToggle";
import Nav from "../Nav/Nav";
import "./Settings.css";

function Settings() {
  return (
    <div className="settings-container">
      <Nav />
      
      <div className="settings-content">
        <header className="settings-header">
          <h1 className="settings-title">System Settings</h1>
          <p className="settings-subtitle">Manage your application preferences and account settings</p>
        </header>

        <div className="settings-grid">
          <section className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">
                <span className="settings-card-icon">🎨</span>
                Appearance
              </h2>
            </div>
            
            <div className="settings-form-group">
              <label className="settings-label">Theme Preference</label>
              <div className="settings-toggle-group">
                <span>Dark Mode</span>
                <ThemeToggle />
              </div>
            </div>

            <div className="settings-form-group">
              <label className="settings-label">Accent Color</label>
              <div className="settings-color-picker">
                <button className="color-option blue active" aria-label="Blue theme"></button>
                <button className="color-option emerald" aria-label="Emerald theme"></button>
                <button className="color-option violet" aria-label="Violet theme"></button>
                <button className="color-option amber" aria-label="Amber theme"></button>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">
                <span className="settings-card-icon">👤</span>
                Account Settings
              </h2>
            </div>
            
            <div className="settings-form-group">
              <label className="settings-label">Change Username</label>
              <input 
                type="text" 
                className="settings-input" 
                placeholder="Enter new username"
              />
            </div>

            <div className="settings-form-group">
              <label className="settings-label">Change Password</label>
              <input 
                type="password" 
                className="settings-input" 
                placeholder="Enter new password"
              />
              <input 
                type="password" 
                className="settings-input" 
                placeholder="Confirm new password"
              />
              <div className="settings-btn-group">
                <button className="settings-btn settings-btn-primary">
                  Save Changes
                </button>
                <button className="settings-btn settings-btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">
                <span className="settings-card-icon">🔔</span>
                Notifications
              </h2>
            </div>
            
            <div className="settings-form-group">
              <div className="settings-toggle-group">
                <span>Email Notifications</span>
                <label className="settings-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="settings-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-form-group">
              <div className="settings-toggle-group">
                <span>Push Notifications</span>
                <label className="settings-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="settings-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-form-group">
              <div className="settings-toggle-group">
                <span>System Alerts</span>
                <label className="settings-switch">
                  <input type="checkbox" />
                  <span className="settings-slider"></span>
                </label>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">
                <span className="settings-card-icon">⚙️</span>
                System Preferences
              </h2>
            </div>
            
            <div className="settings-form-group">
              <label className="settings-label">Language</label>
              <select className="settings-select">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <div className="settings-form-group">
              <label className="settings-label">Timezone</label>
              <select className="settings-select">
                <option>(UTC) Coordinated Universal Time</option>
                <option>(EST) Eastern Standard Time</option>
                <option>(PST) Pacific Standard Time</option>
              </select>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Settings;