import { createContext, useEffect, useState } from "react";
import { loginStudentApi, registerStudentApi } from "../api/authApi";
import React from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const savedStudent = localStorage.getItem("student");
    if (savedStudent) {
      setStudent(JSON.parse(savedStudent));
    }
  }, []);

  // ✅ LOGIN
  const login = async (email, password) => {
    const res = await loginStudentApi({ email, password });

    const { student, accessToken } = res.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("student", JSON.stringify(student));

    setStudent(student);
  };

  // ✅ REGISTER (optional, for later)
  const register = async (formData) => {
    const res = await registerStudentApi(formData);
    return res;
  };

  // ✅ LOGOUT
  const logout = () => {
    setStudent(null);
    localStorage.removeItem("student");
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ student, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
