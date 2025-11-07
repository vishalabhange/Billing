import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ShopTypeSelection.css"; // External CSS file

export default function ShopTypeSelection({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const selectShopType = async (type) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You must be logged in to select a shop type.");
      }

      const res = await fetch("http://localhost:5000/api/auth/set-shop-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shop_type: type }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from server");
      }

      if (res.status === 401 || res.status === 403) {
        throw new Error("Session expired. Please log in again.");
      }
      if (!res.ok) {
        throw new Error(data.message || "Failed to set shop type");
      }

      alert("Shop type set successfully!");
      onComplete?.();
      navigate("/Welcome");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ShopTypeSel-container">
      <div className="ShopTypeSel-header">
        <h1>Welcome to POS Shop Setup</h1>
        <p>Please select your shop type to get started with your personalized dashboard.</p>
      </div>

      {error && <div className="ShopTypeSel-error">{error}</div>}

      <div className="ShopTypeSel-card-container">
        <div className="ShopTypeSel-card" onClick={() => selectShopType("general")}>
          <img src="/images/general_store.jpg" alt="General Store" className="ShopTypeSel-image" />
          <h3>General Store</h3>
          <p>Perfect for everyday essentials, grocery, and household items.</p>
          <button disabled={loading} className="ShopTypeSel-button">
            Select General Store
          </button>
        </div>

        <div className="ShopTypeSel-card" onClick={() => selectShopType("sweet")}>
          <img src="/images/sweet_shop.jpg" alt="Sweet Shop" className="ShopTypeSel-image" />
          <h3>Sweet Shop</h3>
          <p>Ideal for selling sweets, snacks, desserts, and related items.</p>
          <button disabled={loading} className="ShopTypeSel-button">
            Select Sweet Shop
          </button>
        </div>
      </div>

      <div className="ShopTypeSel-footer">
        <p>Need help choosing? Contact our support or visit the documentation for more details.</p>
      </div>
    </div>
  );
}
