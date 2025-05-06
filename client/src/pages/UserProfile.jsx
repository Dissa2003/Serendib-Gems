import React from "react";
import "../pages/css/UserProfile.css";
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer";

const UserProfile = () => {
  // Dummy user data (Replace this with actual user data from the backend)
  const user = {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+61 123 456 789",
    address: "123 Gemstone Avenue, Sydney, Australia",
    joinedDate: "January 15, 2024",
    profilePicture: "https://via.placeholder.com/150", // Placeholder profile picture
  };

  const handleUpdate = () => {
    alert("Update feature coming soon!"); // Replace with actual update logic
  };

  const handleDelete = () => {
    alert("Account deleted successfully!"); // Replace with actual delete logic
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <img
            src={user.profilePicture}
            alt="User Profile"
            className="profile-picture"
          />
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-info"><strong>Email:</strong> {user.email}</p>
          <p className="profile-info"><strong>Phone:</strong> {user.phone}</p>
          <p className="profile-info"><strong>Address:</strong> {user.address}</p>
          <p className="profile-info"><strong>Member Since:</strong> {user.joinedDate}</p>
          
          <div className="profile-actions">
            <button className="update-btn" onClick={handleUpdate}>Update</button>
            <button className="delete-btn" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
