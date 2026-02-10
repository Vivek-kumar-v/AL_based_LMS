import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePasswordApi } from "../../api/authApi";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.oldPassword || !form.newPassword)
      return toast.error("All fields are required");

    if (form.newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");

    if (form.newPassword !== form.confirmPassword)
      return toast.error("Passwords do not match");

    try {
      setLoading(true);

      await changePasswordApi({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      toast.success("Password updated successfully ✅");
      setTimeout(() => navigate("/settings"), 800);
    } catch (err) {
      console.log("CHANGE PASSWORD ERROR:", err);
      console.log("RESPONSE:", err?.response?.data);
    
      toast.error(err?.response?.data?.message || "Password update failed");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-xl mx-auto"
      >
        <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Change Password 🔑
            </h1>

            <Link
              to="/settings"
              className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              ← Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Old Password"
              name="oldPassword"
              type="password"
              value={form.oldPassword}
              onChange={handleChange}
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <button
              disabled={loading}
              className={`w-full px-6 py-4 rounded-2xl font-extrabold text-white transition
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Input = ({ label, ...props }) => {
  return (
    <div>
      <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
        {label}
      </label>
      <input
        {...props}
        className="mt-2 w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white rounded-2xl px-4 py-3 outline-none
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />
    </div>
  );
};

export default ChangePassword;
