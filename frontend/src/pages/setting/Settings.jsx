import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { ThemeContext } from "../../context/ThemeContext";
import { deleteAccountApi } from "../../api/authApi";

const Settings = () => {
  const navigate = useNavigate();
  const { student, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved !== null) setNotifications(saved === "true");
  }, []);

  const handleToggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("notifications", String(next));
    toast.success(next ? "Notifications enabled 🔔" : "Notifications disabled 🔕");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    const confirm1 = confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!confirm1) return;

    const confirm2 = confirm("Last warning ⚠️\nThis will permanently delete your account.");
    if (!confirm2) return;

    try {
      await deleteAccountApi();
      toast.success("Account deleted successfully ✅");
      logout();
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const avatarUrl =
    student?.avatar ||
    `https://ui-avatars.com/api/?name=${
      student?.fullName || "Student"
    }&background=111827&color=fff`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Settings ⚙️
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your account and preferences.
          </p>

          {/* Profile */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-20 h-20 rounded-full border border-gray-300 dark:border-gray-700 object-cover"
            />

            <div className="flex-1">
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                {student?.fullName || "Student"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                @{student?.username || "N/A"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {student?.email || "N/A"}
              </p>
            </div>

            <button
              onClick={() => navigate("/profile/edit")}
              className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition"
            >
              Edit Profile ✨
            </button>
          </div>

          {/* SETTINGS GRID */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Theme Toggle */}
            <SettingToggleCard
              title="Dark Mode"
              desc="Switch between light and dark theme."
              value={theme === "dark"}
              onToggle={toggleTheme}
              icon="🌙"
            />

            {/* Notifications */}
            <SettingToggleCard
              title="Notifications"
              desc="Enable or disable notifications."
              value={notifications}
              onToggle={handleToggleNotifications}
              icon="🔔"
            />

            {/* Change Password */}
            <SettingCard
              title="Change Password"
              desc="Update your account password securely."
              buttonText="Change"
              icon="🔑"
              onClick={() => navigate("/settings/change-password")}
            />

            {/* Logout */}
            <SettingCard
              title="Logout"
              desc="Sign out safely from your account."
              buttonText="Logout"
              icon="🚪"
              danger
              onClick={handleLogout}
            />

            {/* Delete Account */}
            <SettingCard
              title="Delete Account"
              desc="This will permanently delete your account."
              buttonText="Delete"
              icon="🗑️"
              danger
              onClick={handleDeleteAccount}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SettingCard = ({ title, desc, buttonText, onClick, danger, icon }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-6"
    >
      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{desc}</p>

      <button
        onClick={onClick}
        className={`mt-5 px-6 py-3 rounded-2xl font-extrabold transition
          ${
            danger
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-black dark:bg-white dark:text-black text-white hover:bg-gray-900 dark:hover:bg-gray-100"
          }`}
      >
        {buttonText}
      </button>
    </motion.div>
  );
};

const SettingToggleCard = ({ title, desc, value, onToggle, icon }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-6 flex items-center justify-between"
    >
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{desc}</p>
      </div>

      <button
        onClick={onToggle}
        className={`w-14 h-8 rounded-full transition flex items-center px-1
          ${value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}
      >
        <div
          className={`w-6 h-6 rounded-full bg-white transition
            ${value ? "translate-x-6" : "translate-x-0"}`}
        />
      </button>
    </motion.div>
  );
};

export default Settings;
