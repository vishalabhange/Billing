import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "./LogSign.css";
import BillingBg from "../Imgs/logbg.jpg";

const LoginPage = ({ showAlert }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.user.role);
      navigate("/Welcome");
    } else {
      showAlert(data.error || "Login failed", "danger");
    }
  };

  return (
    <div
      className="login-wrapper billing-background"
      style={{ backgroundImage: `url(${BillingBg})` }}
    >
      {/* Left Side - Floating Login Form */}
      <div className="login-container">
        <h2 className="login-title">Login to POS</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button className="login-button" type="submit">
            Login
          </button>
        </form>
        <p className="login-text">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
