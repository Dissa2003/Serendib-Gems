import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Components/Home/Home";
import AddUser from "./Components/AddUser/AddUser";
import Users from "./Components/User Details/Users";
import User from "./Components/User/User";
import UpdateUser from "./Components/Update User/UpdateUser";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Reports from "./Components/Reports/Reports";
import Settings from "./Components/Settings/Settings";
import AddUserH from "./adduser/AddUser";
import Login from "./adduser/Userlogin";  
import Profile from './adduser/UserProfile/Profile';
import AdminLogin from "./adduser/Adminlogin/AdminLogin";
import RegisteredUsers from "./Components/UserRegister/RegisteredUsers";







function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      <Routes>
      <Route path="/" element={<AdminDashboard />} />
        
        <Route path="/mainhome" element={<Home />} />
        <Route path="/adduser" element={<AddUser />} />
        <Route path="/userdetails" element={<Users />} />
        <Route path="/userdetails/:id/update" element={<UpdateUser />} />
        <Route path="/userdetails/:id" element={<User />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/adduserh" element={<AddUserH />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registeredusers" element={<RegisteredUsers />} />
        <Route path="/register" element={<RegisteredUsers />} />
        <Route path="/profile" element={<Profile /> }/>
        <Route path="/adminlogin" element={<AdminLogin />} />

        
        
      </Routes>
    </div>
  );
}

export default App;
