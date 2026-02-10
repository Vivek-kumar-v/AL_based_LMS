import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { uploadAvatarApi, updateProfileApi } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";

const EditProfile = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const { student, setStudent } = useAuth();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    collegeName: "",
    department: "",
    semester: "",
    avatar: "",
  });

  useEffect(() => {
    if (!student) return;

    setForm({
      fullName: student?.fullName || "",
      username: student?.username || "",
      collegeName: student?.collegeName || "",
      department: student?.department || "",
      semester: student?.semester ? String(student.semester) : "",
      avatar: student?.avatar || student?.profileImage || "",
    });
  }, [student]);

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 text-center max-w-md w-full">
          <p className="text-gray-800 font-extrabold text-lg">
            No student data found 😕
          </p>
          <p className="text-gray-600 mt-2">Please login again.</p>
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);

      const res = await uploadAvatarApi(file);

      // ✅ FIXED
      const avatarUrl = res?.data?.data?.avatarUrl;

      if (!avatarUrl) {
        toast.error("Avatar upload failed");
        return;
      }

      setForm((prev) => ({ ...prev, avatar: avatarUrl }));
      toast.success("Avatar updated ✅");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Avatar upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) return toast.error("Full name is required");
    if (!form.username.trim()) return toast.error("Username is required");

    try {
      setSaving(true);

      const payload = {
        fullName: String(form.fullName || "").trim(),
        username: String(form.username || "").trim(),
        collegeName: String(form.collegeName || "").trim(),
        department: String(form.department || "").trim(),
        semester: String(form.semester || "").trim(),
        avatar: form.avatar,
      };      

      const res = await updateProfileApi(payload);

      // ✅ FIXED (ApiResponse format)
      const updatedStudent = res?.data?.data?.student;

      if (!updatedStudent) {
        toast.error("Update failed (no student returned)");
        return;
      }

      // ✅ Update auth + localStorage
      localStorage.setItem("student", JSON.stringify(updatedStudent));
      setStudent?.(updatedStudent);

      toast.success("Profile updated successfully 🎉");

      setTimeout(() => navigate("/profile"), 700);
    } catch (err) {
        console.log("ERROR:", err);
        console.log("MESSAGE:", err?.message);
        console.log("RESPONSE:", err?.response);        
      toast.error(err?.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl =
    form.avatar ||
    `https://ui-avatars.com/api/?name=${form.fullName || "Student"}&background=111827&color=fff`;

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
                Edit Profile ✨
              </h1>
              <p className="text-gray-600 mt-1">
                Update your account details and profile photo.
              </p>
            </div>

            <Link
              to="/profile"
              className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition w-fit"
            >
              ← Back
            </Link>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-5 shadow-sm">
            <div className="relative w-fit">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-24 h-24 rounded-full border border-gray-300 object-cover"
              />
              <div className="absolute inset-0 rounded-full ring-4 ring-blue-500/15" />
            </div>

            <div className="flex-1">
              <p className="text-lg font-extrabold text-gray-900">
                Change Avatar
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Upload a clear photo. It will be stored in Cloudinary.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className={`px-5 py-3 rounded-2xl font-extrabold text-white transition
                    ${
                      uploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-black hover:bg-gray-900"
                    }`}
                >
                  {uploading ? "Uploading..." : "Upload New Photo"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      avatar: "",
                    }))
                  }
                  className="px-5 py-3 rounded-2xl font-extrabold bg-gray-100 text-gray-900 hover:bg-gray-200 transition"
                >
                  Remove
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                />
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="mt-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
              />

              <Input
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
              />

              <Input
                label="College Name"
                name="collegeName"
                value={form.collegeName}
                onChange={handleChange}
                placeholder="Enter college name"
              />

              <Input
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Enter department"
              />

              <Input
                label="Semester"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                placeholder="Eg: 4"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              className={`w-full rounded-2xl px-6 py-4 font-extrabold text-white shadow-md transition
                ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {saving ? "Saving..." : "Save Changes 🚀"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Input = ({ label, ...props }) => {
  return (
    <div>
      <label className="text-sm font-bold text-gray-800">{label}</label>
      <input
        {...props}
        className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />
    </div>
  );
};

export default EditProfile;
