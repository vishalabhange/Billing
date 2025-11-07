// components/AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ isAuthenticated, userRole, children }) => {
  if (!isAuthenticated || userRole !== "admin") {
    return <Navigate to="/" />;
  }
  return children;
};

export default AdminRoute;
