import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerStudentApi } from "../../api/authApi";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    collegeName: "",
    department: "",
    semester: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!avatar) {
      setError("Avatar is required");
      return;
    }

    const formData = new FormData();
    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("fullName", form.fullName);
    formData.append("collegeName", form.collegeName);
    formData.append("department", form.department);
    formData.append("semester", form.semester);
    formData.append("password", form.password);
    formData.append("avatar", avatar);

    try {
      setLoading(true);
      await registerStudentApi(formData);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold mb-4">Register Student</h1>

        {error && (
          <div className="mb-3 rounded bg-red-100 p-2 text-red-700">
            {error}
          </div>
        )}

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
        />

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="College Name"
          name="collegeName"
          value={form.collegeName}
          onChange={handleChange}
        />

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Department"
          name="department"
          value={form.department}
          onChange={handleChange}
        />

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Semester (eg: 6)"
          name="semester"
          value={form.semester}
          onChange={handleChange}
        />

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
        />

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          className="w-full border p-2 rounded mb-3"
          placeholder="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <label className="block mb-2 font-medium">Avatar</label>
        <input
          type="file"
          className="w-full border p-2 rounded mb-4"
          onChange={(e) => setAvatar(e.target.files[0])}
        />

        <button
          disabled={loading}
          className="w-full rounded bg-black text-white p-2 hover:bg-gray-800"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link className="text-blue-600 underline" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
