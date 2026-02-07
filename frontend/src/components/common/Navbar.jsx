import { Link, useNavigate } from "react-router-dom";
import React from "react";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // For now just clear token (if you store in localStorage)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("student");

    navigate("/login");
  };

  return (
    <div className="w-full bg-white shadow">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        {/* Left Side */}
        <h1 className="text-xl font-bold text-black">ConceptVault</h1>

        {/* Center Links */}
        <div className="flex gap-4 text-sm font-semibold">
          <Link to="/dashboard" className="hover:underline text-blue-600">
            Dashboard
          </Link>

          <Link to="/upload" className="hover:underline text-blue-600">
            Upload
          </Link>

          <Link to="/notes" className="hover:underline text-blue-600">
            Notes
          </Link>

          <Link to="/pyqs" className="hover:underline text-blue-600">
            PYQs
          </Link>

          {/* ✅ Smart Search */}
          <Link to="/search" className="hover:underline text-blue-600">
            Smart Search
          </Link>

          <Link to="/profile" className="text-blue-600 font-medium hover:underline">
            Profile
          </Link>

        </div>

        {/* Right Side */}
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
