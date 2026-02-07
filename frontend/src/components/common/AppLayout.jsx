import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;
