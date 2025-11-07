import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import OrderSummary from "./OrderSummary";
import "./POSHome.css";
import "./Sidebar.css";
import "./OrderSummary.css";
import Default from "../../Imgs/Def.jpeg";
import POSNavbar from "./POSNavbar";

const POSHome = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 search state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No token found — redirecting to login");
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:5000/api/products", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Fetch products error:", errorData);
          if (res.status === 403 || res.status === 401) {
            navigate("/login");
          }
          setMenuItems([]);
          return;
        }

        const data = await res.json();
        setMenuItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setMenuItems([]);
      }
    };

    fetchProducts();
  }, [navigate]);

  const handleAddToCart = (item) => {
    console.log("Adding item:", item);
    setCartItems((prevCart) => {
      const itemIndex = prevCart.findIndex(
        (cartItem) => cartItem.id === item.id
      );

      if (itemIndex !== -1) {
        return prevCart.map((cartItem, index) =>
          index === itemIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  // 🔍 Filter menuItems based on searchTerm
  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <POSNavbar />
      <div className="POS-dashboard">
        <Sidebar />

        <main className="POS-menu">
          {/* 🔍 Search bar */}
          <div className="POS-searchbar">
            <input
              type="text"
              placeholder="Search menu"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>

          <div className="POS-grid">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item, idx) => (
                <div className="POS-card" key={idx}>
                  <div className="POS-image-wrapper">
                    <img
                      src={item.image || Default}
                      alt={item.name || "Product"}
                    />
                  </div>
                  <p className="POS-name">{item.name}</p>

                  <div className="POS-info">
                    <span className="POS-available">Available</span>
                    <span className="POS-price">₹{item.price}</span>
                  </div>

                  <button onClick={() => handleAddToCart(item)}>Add</button>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                No products found. Please check your search or add products.
              </p>
            )}
          </div>
        </main>

        <OrderSummary items={cartItems} />
      </div>
    </>
  );
};

export default POSHome;
