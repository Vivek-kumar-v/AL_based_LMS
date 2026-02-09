import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  // ✅ Get student from localStorage
  const student = JSON.parse(localStorage.getItem("student")) || {};
  const profileImage =
    student?.profileImage || student?.avatar || student?.photo || "";

  const studentName = student?.name || student?.fullName || "User";

  // Initials fallback
  const initials = studentName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("student");
    navigate("/login");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Upload", path: "/upload" },
    { name: "Notes", path: "/notes" },
    { name: "PYQs", path: "/pyqs" },
    { name: "Smart Search", path: "/search" },
    { name: "Concepts", path: "/concepts" },
  ];

  return (
    <motion.div
      initial={{ y: -35, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full sticky top-0 z-50"
    >
      <div className="w-full bg-white/70 backdrop-blur-2xl border-b border-gray-200 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)]">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          {/* Logo */}
          <Link to="/dashboard">
            <motion.h1
              whileHover={{ scale: 1.03 }}
              className="text-xl font-extrabold text-gray-900 tracking-tight select-none"
            >
              Concept<span className="text-blue-600">Vault</span>
            </motion.h1>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-1 text-sm font-bold">
            {navLinks.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`relative px-4 py-2 rounded-2xl transition-all duration-200
                      ${
                        active
                          ? "bg-gray-900 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {item.name}

                    {/* Active underline animation */}
                    {active && (
                      <motion.div
                        layoutId="activeLink"
                        className="absolute left-4 right-4 -bottom-[6px] h-[3px] rounded-full bg-blue-600"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 relative" ref={menuRef}>
            {/* Profile Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 transition"
            >
              {/* Avatar */}
              {profileImage ? (
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                  />
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-full ring-2 ring-blue-500/30" />
                </div>
              ) : (
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm">
                    {initials}
                  </div>
                  <div className="absolute inset-0 rounded-full ring-2 ring-blue-500/30" />
                </div>
              )}

              {/* Name */}
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-sm font-extrabold text-gray-900">
                  {studentName}
                </span>
                <span className="text-xs text-gray-500 font-semibold">
                  View Profile
                </span>
              </div>
            </motion.button>

            {/* 3 Dot Menu */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setOpenMenu(!openMenu)}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gray-900 text-white hover:bg-black transition shadow-sm"
            >
              <span className="text-xl leading-none">⋮</span>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {openMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-14 w-56 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-extrabold text-gray-900">
                      {studentName}
                    </p>
                    <p className="text-xs text-gray-500 font-semibold">
                      Manage your account
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 font-semibold"
                  >
                    👤 My Profile
                  </button>

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      navigate("/settings");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 font-semibold"
                  >
                    ⚙️ Settings
                  </button>

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      alert("Support coming soon 😄");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 font-semibold"
                  >
                    ❓ Help
                  </button>

                  <div className="h-[1px] bg-gray-200" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-extrabold"
                  >
                    🚪 Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Links */}
        <div className="md:hidden px-4 pb-3 flex gap-2 overflow-x-auto">
          {navLinks.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition
                    ${
                      active
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
