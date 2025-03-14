import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaPlus, FaClipboardList, FaFileAlt, FaThLarge, FaBell, FaUserCircle } from "react-icons/fa";
import Button from "../components/ui/button";
import './css/home.css'; // Import the CSS file

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">Serendib Gems</div>
        <nav className="flex gap-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link to="/users" className="text-gray-700 hover:text-blue-600">Gem Inventory</Link>
          <Link to="/categories" className="text-gray-700 hover:text-blue-600">Categories</Link>
          <Link to="/reports" className="text-gray-700 hover:text-blue-600">Reports</Link>
          <Link to="/profile" className="text-gray-700 hover:text-blue-600 flex items-center">
            <FaUserCircle className="mr-1" /> Profile
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <input type="text" placeholder="Search gems..." className="border p-2 rounded-md" />
          <FaSearch className="text-gray-600 cursor-pointer" />
          <FaBell className="text-gray-600 cursor-pointer" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <h1 className="text-4xl font-bold">Your Ultimate Solution for Gem Inventory Management</h1>
        <p className="mt-4 text-lg">Track, manage, and optimize your gem collection seamlessly.</p>
        <Button className="mt-6 bg-white text-blue-700 px-6 py-3 rounded-full font-semibold">
          <Link to="/inventory">Explore Inventory</Link>
        </Button>
      </section>

      {/* Quick Access Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8">
        <QuickAccessCard icon={<FaPlus />} text="Add New Gem" link="/add-gem" />
        <QuickAccessCard icon={<FaClipboardList />} text="View Gem Inventory" link="/inventory" />
        <QuickAccessCard icon={<FaFileAlt />} text="Generate Reports" link="/reports" />
        <QuickAccessCard icon={<FaThLarge />} text="Manage Categories" link="/categories" />
      </section>

      {/* Recent Activity Section */}
      <section className="p-8 bg-white shadow-md rounded-lg m-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Gem Name</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Date Added</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Ruby Star</td>
              <td className="p-2 border">Ruby</td>
              <td className="p-2 border">2025-03-10</td>
              <td className="p-2 border text-green-600">Available</td>
            </tr>
          </tbody>
        </table>
        <div className="text-right mt-4">
          <Link to="/inventory" className="text-blue-600">View All</Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white text-center p-4 mt-8">
        <div className="flex justify-center gap-4 mb-2">
          <Link to="/about" className="hover:underline">About Us</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>
        <p>© 2025 Serendib Gems. All rights reserved.</p>
      </footer>
    </div>
  );
};

const QuickAccessCard = ({ icon, text, link }) => {
  return (
    <Link to={link} className="bg-white shadow-md p-6 flex flex-col items-center rounded-lg hover:bg-gray-100">
      <div className="text-blue-600 text-3xl">{icon}</div>
      <p className="mt-2 font-semibold">{text}</p>
    </Link>
  );
};

export default HomePage;
