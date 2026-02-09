import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import React from "react";

const ProtectedRoute = ({ children }) => {
  const { student, authLoading } = useAuth();
  const token = localStorage.getItem("accessToken");

  if (authLoading) {
    return <div className="p-6">Checking login...</div>;
  }

  if (!student && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
