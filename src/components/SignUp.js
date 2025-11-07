import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import "./LogSign.css";
import BillingBg from "../Imgs/logbg.jpg";

const SignupPage = ({ showAlert }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      navigate("/select-shop-type");
    } else {
      showAlert(data.error || "Signup failed", "danger");
    }
  };

  return (
    <div
      className="login-wrapper billing-background"
      style={{ backgroundImage: `url(${BillingBg})` }}
    >
      {/* Left Side - Floating Signup Form */}
      <div className="signup-container">
        <h2 className="login-title">Create an Account</h2>

        <form className="signup-form" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              className="login-input"
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              className="login-input"
              name="email"
              type="email"
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
              name="password"
              type={showPassword ? "text" : "password"}
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

          {/* Role Selection */}
          <select
            name="role"
            className="login-input select-input"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button className="login-button" type="submit">
            Register
          </button>
        </form>

        <p className="login-text">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
