import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import React from "react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("MESSAGE:", err.message);
      console.log("RESPONSE:", err.response);
      setError(err.message);
    }
     finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold mb-4">Student Login</h1>

        {error && (
          <div className="mb-3 rounded bg-red-100 p-2 text-red-700">
            {error}
          </div>
        )}

        <label className="block mb-2 font-medium">Email</label>
        <input
          className="w-full border p-2 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />

        <label className="block mb-2 font-medium">Password</label>
        <input
          type="password"
          className="w-full border p-2 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />

        <button
          disabled={loading}
          className="w-full rounded bg-black text-white p-2 hover:bg-gray-800"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-sm">
          Don’t have an account?{" "}
          <Link className="text-blue-600 underline" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
