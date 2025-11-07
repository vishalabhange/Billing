// WelcomePage.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./WelcomePage.css";
import axios from "axios";

const WelcomePage = () => {
  //   const history = useHistory();
  const navigate = useNavigate();
  // const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const getAuthToken = () => {
    const authToken = localStorage.getItem("authToken");
    return authToken;
  };


  // const name = new URLSearchParams(location.search).get("name");
  // console.log("Name:", name);

  const [countdown, setCountdown] = useState(3);

  // Redirect to home page after 3 seconds
  useEffect(() => {


    // Get the JWT token
    const authToken = getAuthToken();

    // Set up the headers with the JWT token
    const headers = {
      Authorization: `${authToken}`,
    };

    axios
      .get("http://localhost:8000/api/auth/Profile", { headers })
      .then((response) => {
        // Ensure that response.data.vendorDetails is an object
        if (typeof response.data.vendorDetails === "object") {
          setProfileData(response.data.vendorDetails); // Set profile data to the vendorDetails object
        } else {
          console.error("Invalid data received from the profile API");
        }
      })
      .catch((error) => {
        console.error("Error fetching profile data: " + error);
      });


    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    }; // Cleanup to avoid memory leaks
  }, [navigate]);

  return (
    <section id="welcome-section">
      <div>
        <h1>Welcome {profileData?.Name}</h1>
        <p>...have a look around</p>
      </div>
    </section>
  );
};

export default WelcomePage;
