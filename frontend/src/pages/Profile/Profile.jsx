import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No student data found. Please login.</p>
      </div>
    );
  }

  const avatarUrl =
    student?.avatar ||
    `https://ui-avatars.com/api/?name=${student?.fullName || "Student"}&background=000&color=fff`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-20 h-20 rounded-full border object-cover"
          />

          <div>
            <p className="text-lg font-semibold">{student.fullName || "N/A"}</p>
            <p className="text-gray-600">@{student.username || "N/A"}</p>
            <p className="text-gray-500 text-sm">{student.email || "N/A"}</p>
          </div>
        </div>

        {/* PROFILE DETAILS */}
        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm text-gray-500">Semester</p>
            <p className="font-medium">{student.semester || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium">
              {student.createdAt
                ? new Date(student.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
          >
            Go to Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
