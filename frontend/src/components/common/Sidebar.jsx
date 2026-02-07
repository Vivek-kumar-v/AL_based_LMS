import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-lg font-medium ${
      isActive
        ? "bg-black text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="w-64 bg-white shadow min-h-screen p-4 hidden md:block">
      <h2 className="text-xl font-bold mb-6">ConceptVault</h2>

      <div className="space-y-2">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/upload" className={linkClass}>
          Upload
        </NavLink>

        <NavLink to="/notes" className={linkClass}>
          Notes
        </NavLink>

        <NavLink to="/pyqs" className={linkClass}>
          PYQs
        </NavLink>

        <NavLink to="/search" className={linkClass}>
          Smart Search
        </NavLink>

        <NavLink to="/concepts" className={linkClass}>
          Concepts
        </NavLink>

        <NavLink to="/profile" className={linkClass}>
          Profile
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
