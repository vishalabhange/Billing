import React, { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

// Authentication Components
import SignupPage from "./components/SignUp.js";
import LoginPage from "./components/LogIn.js";

// BC Components
import Welcome from "./bc-Components/Others/Welcome";
import Alert from "./bc-Components/Others/Alert";


// Access control wrappers
import PrivateRoute from "./components/PrivateRoute.js";
import AdminRoute from "./components/AdminRoute.js";
import Home from "./bc-Components/Home/Home.js";
import Inventory from "./bc-Components/Inventory/Inventory.js";
import POSHome from "./bc-Components/POSHome/POSHome.js";
import BillDetaile from "./bc-Components/POSHome/BillDetaile.js";
import OrderList from "./bc-Components/Orders/OrderList.js";
import History from "./bc-Components/Orders/History.js";
import Bills from "./bc-Components/Orders/Bill.js";
import ShopTypeSelection from "./components/ShopTypeSelection.js";
import Scanner from "./bc-Components/Scanner/Scanner.js";

const App = () => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole"); // save 'userRole' in localStorage at login

  const [alert, setAlert] = useState(null);
  const showAlert = (message, type) => {
    setAlert({ msg: message, type });
    setTimeout(() => setAlert(null), 1500);
  };

  return (
    <>
      {/* <Navbar /> */}
      <Alert alert={alert} />
      <Routes>
        {/* Public Routes */}
        <Route path="/LogIn" element={<LoginPage showAlert={showAlert} />} />
        <Route path="/signup" element={<SignupPage showAlert={showAlert} />} />
        <Route path="/select-shop-type" element={<ShopTypeSelection />} />

        {/* Private Routes (user + admin) */}
        <Route
          path="/Welcome"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Welcome />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <POSHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/bill/:billNumber"
          element={<BillDetaile />}
        />

        <Route
          path="/Home"
          element={
            <AdminRoute isAuthenticated={isAuthenticated} userRole={userRole}>
              <Home />
            </AdminRoute>
          }
        />
        <Route
          path="/AddExtra"
          element={
            isAuthenticated && userRole === "admin" ? (
              <Inventory showAlert={showAlert} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/Order-List"
          element={
            isAuthenticated && userRole === "admin" ? (
              <OrderList showAlert={showAlert} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/History"
          element={
            isAuthenticated && userRole === "admin" ? (
              <History showAlert={showAlert} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/Bills"
          element={
            isAuthenticated && userRole === "admin" ? (
              <Bills showAlert={showAlert} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        {/* Scanner route */}
        <Route
          path="/scanner"
          element={<Scanner onDetected={(txt) => console.log("got barcode:", txt)} />}
        />
      </Routes>
    </>
  );
};

export default App;
