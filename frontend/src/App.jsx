import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import React from "react";

function App() {
  const location = useLocation();

  // Hide navbar on login/register
  const hideLayout =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300 flex flex-col">
      {!hideLayout && <Navbar />}

      {/* Pages */}
      <div className="flex-1">
        <AppRoutes />
      </div>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
