import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import React from "react";

// Pages
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import SmartSearch from "../pages/Search/SmartSearch";
import Profile from "../pages/Profile/Profile";
import Concepts from "../pages/Concepts/Concepts";
import ConceptPage from "../pages/Concepts/ConceptPage";
import EditDocument from "../pages/Documents/EditDocument";




import UploadDocument from "../pages/Documents/UploadDocument";
import Notes from "../pages/Documents/Notes";
import PYQs from "../pages/Documents/PYQs";
import ConceptDetails from "../components/concepts/ConceptDetails";
import EditProfile from "../pages/Profile/EditProfile";
import Settings from "../pages/setting/Settings";
import ChangePassword from "../pages/setting/ChangePassword";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/concepts"
        element={
          <ProtectedRoute>
            <Concepts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/concepts/:conceptId"
        element={
          <ProtectedRoute>
            <ConceptDetails />
          </ProtectedRoute>
        }
      />

    <Route path="/profile/edit" element={<EditProfile />} />




      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadDocument />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SmartSearch />
          </ProtectedRoute>
        }
      />

    <Route path="/documents/edit/:documentId" element={<EditDocument />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/settings/change-password" element={<ChangePassword />} />




      <Route
        path="/pyqs"
        element={
          <ProtectedRoute>
            <PYQs />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
