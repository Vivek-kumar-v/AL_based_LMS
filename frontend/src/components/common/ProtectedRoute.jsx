import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import React from "react";

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();

  // ✅ if auth context not ready yet
  if (!auth) return <div>Loading...</div>;

  const { student } = auth;

  if (!student) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
