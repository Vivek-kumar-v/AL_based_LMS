import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Profile = () => {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 text-center max-w-md w-full">
          <p className="text-gray-800 font-extrabold text-lg">
            No student data found 😕
          </p>
          <p className="text-gray-600 mt-2">
            Please login again to view your profile.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 px-6 py-3 rounded-2xl bg-black text-white font-extrabold hover:bg-gray-900 transition w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const avatarUrl =
    student?.avatar ||
    student?.profileImage ||
    `https://ui-avatars.com/api/?name=${
      student?.fullName || "Student"
    }&background=111827&color=fff`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                My Profile 👤
              </h1>
              <p className="text-gray-600 mt-1">
                View your account details and student info.
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-3 rounded-2xl bg-black text-white font-extrabold hover:bg-gray-900 transition w-fit"
            >
              Go to Dashboard →
            </button>
          </div>

          {/* Profile Top Card */}
          <motion.div
            whileHover={{ y: -2 }}
            className="flex flex-col sm:flex-row sm:items-center gap-5 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-5 shadow-sm"
          >
            {/* Avatar */}
            <div className="relative w-fit">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-24 h-24 rounded-full border border-gray-300 object-cover"
              />
              <div className="absolute inset-0 rounded-full ring-4 ring-blue-500/15" />
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <p className="text-2xl font-extrabold text-gray-900">
                {student.fullName || "N/A"}
              </p>

              <p className="text-gray-600 font-semibold mt-1">
                @{student.username || "N/A"}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                {student.email || "N/A"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-4 py-2 rounded-2xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  🎓 Student
                </span>

                <span className="px-4 py-2 rounded-2xl text-xs font-extrabold bg-gray-100 text-gray-900 border border-gray-200">
                  Semester: {student.semester || "N/A"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Details Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label="College Name"
              value={student.collegeName || "N/A"}
              icon="🏫"
            />
            <InfoCard
              label="Department"
              value={student.department || "N/A"}
              icon="📚"
            />
            <InfoCard
              label="Semester"
              value={student.semester || "N/A"}
              icon="📌"
            />
            <InfoCard
              label="Created At"
              value={
                student.createdAt
                  ? new Date(student.createdAt).toLocaleString()
                  : "N/A"
              }
              icon="🕒"
            />
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/upload")}
              className="px-6 py-3 rounded-2xl bg-white border border-gray-200 font-extrabold text-gray-900 hover:bg-gray-50 transition"
            >
              + Upload Document
            </button>

            <button
              onClick={() => navigate("/notes")}
              className="px-6 py-3 rounded-2xl bg-white border border-gray-200 font-extrabold text-gray-900 hover:bg-gray-50 transition"
            >
              View Notes
            </button>

            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-2xl bg-red-600 text-white font-extrabold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InfoCard = ({ label, value, icon }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm"
    >
      <p className="text-sm text-gray-500 font-bold flex items-center gap-2">
        <span>{icon}</span> {label}
      </p>
      <p className="text-lg font-extrabold text-gray-900 mt-2">{value}</p>
    </motion.div>
  );
};

export default Profile;
