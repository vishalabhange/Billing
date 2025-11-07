import React, { useState, useEffect } from "react";
import "./POSNavbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faListAlt,
  faHistory,
  faFileInvoiceDollar,
  faCog,
  faQuestionCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const POSNavbar = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ✅ Logout function
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      // Clear auth data
      localStorage.removeItem("authToken");
      sessionStorage.clear();

      // Optional: Clear user-specific data if stored
      // localStorage.removeItem("userData");

      // Redirect to login page
      navigate("/login");

      // Optional feedback
      alert("You have been logged out successfully!");
    }
  };

  return (
    <header className="POS-navbar">
      {/* Left: Logo */}
      <div className="POS-logo">
        <img
          src="https://e7.pngegg.com/pngimages/931/225/png-clipart-electronic-bill-payment-logo-service-e-commerce-payment-system-chhattisgarh-blue-angle-thumbnail.png"
          alt="Billings"
          className="POS-logo-img"
        />
        <span className="POS-logo-text">Billings</span>
      </div>

      {/* Center: Navigation */}
      <nav className="POS-nav">
        <a href="/" className="POS-nav-item">
          <FontAwesomeIcon icon={faUtensils} />
          <span>Menu</span>
        </a>
        <a href="/Order-List" className="POS-nav-item">
          <FontAwesomeIcon icon={faListAlt} />
          <span>Order List</span>
        </a>
        <a href="/History" className="POS-nav-item">
          <FontAwesomeIcon icon={faHistory} />
          <span>History</span>
        </a>
        <a href="/Bills" className="POS-nav-item">
          <FontAwesomeIcon icon={faFileInvoiceDollar} />
          <span>Bills</span>
        </a>
        <a href="#" className="POS-nav-item">
          <FontAwesomeIcon icon={faCog} />
          <span>Settings</span>
        </a>
        <a href="#" className="POS-nav-item">
          <FontAwesomeIcon icon={faQuestionCircle} />
          <span>Help</span>
        </a>
      </nav>

      {/* Right: DateTime */}
      <span className="POS-datetime">
        {currentDateTime.toLocaleDateString("en-GB")}{" "}
        {currentDateTime.toLocaleTimeString()}
      </span>

      {/* ✅ Working Logout Button */}
      <button className="POS-logout" onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} />
        <span>Logout</span>
      </button>
    </header>
  );
};

export default POSNavbar;
