import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/common/Navbar";
import React from "react";

function App() {
  const location = useLocation();

  // Hide navbar on login/register
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-100 ">
      {!hideNavbar && <Navbar />}
      <AppRoutes />
    </div>
  );
}

export default App;
