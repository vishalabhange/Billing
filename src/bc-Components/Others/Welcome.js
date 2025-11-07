import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";
import WelcomeImg from "./Welcome.gif"; // replace with your image path

const Welcome = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  // Redirect to home page after 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigate("/"); // change route if needed
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <section id="welcome-section">
      <div className="welcome-container">
        <img src={WelcomeImg} alt="Welcome" className="welcome-image" />
      </div>
    </section>
  );
};

export default Welcome;
