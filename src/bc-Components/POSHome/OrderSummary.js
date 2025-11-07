import React, { useState, useEffect } from "react";
import { QRCode } from "react-qrcode-logo";
import axios from "axios";
import Default from "../../Imgs/Def.jpeg";
import "./OrderSummary.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const OrderSummary = ({ items: incomingItems, onUpdateItems }) => {
  const isControlled = typeof onUpdateItems === "function";
  const [localItems, setLocalItems] = useState(incomingItems || []);

  // keep localItems in sync if parent updates
  useEffect(() => {
    if (!isControlled) setLocalItems(incomingItems || []);
  }, [incomingItems, isControlled]);

  const items = isControlled ? incomingItems || [] : localItems;
  const setItemsSafe = (next) => {
    if (isControlled) onUpdateItems(next);
    else setLocalItems(next);
  };

  const [qrVisible, setQrVisible] = useState(false);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [welcomeMsg, setWelcomeMsg] = useState(""); // new

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cgst = total * 0.09;
  const sgst = total * 0.09;
  const finalTotal = total + cgst + sgst;

  const getAuthToken = () => localStorage.getItem("authToken") || null;

  const handleIncrease = (item) => {
    const updated = items.map((i) =>
      (i.id ?? i.name) === (item.id ?? item.name)
        ? { ...i, quantity: i.quantity + 1 }
        : i
    );
    setItemsSafe(updated);
  };

  const handleDecrease = (item) => {
    const updated = items
      .map((i) =>
        (i.id ?? i.name) === (item.id ?? item.name)
          ? { ...i, quantity: Math.max(i.quantity - 1, 0) }
          : i
      )
      .filter((i) => i.quantity > 0);
    setItemsSafe(updated);
  };

  const handleProceed = async () => {
    if (!items || items.length === 0) {
      alert("No items to create a bill.");
      return;
    }

    // 🧩 Step added: open popup first, don’t post yet
    setShowCustomerPopup(true);
  };

  const confirmAndProceed = async () => {
    if (!customerName.trim()) {
      alert("Please enter customer name or phone number.");
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert("You must be logged in to create a bill.");
        setLoading(false);
        return;
      }

      // ✅ Step 1: Check if customer already exists
      const checkRes = await axios.get(
        `${API_BASE}/api/queueBill/customer/${encodeURIComponent(
          customerName
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (checkRes.data.exists) {
  setWelcomeMsg(`👋 Welcome back, ${checkRes.data.customerName || customerName}!`);
}


      // ✅ Step 2: Proceed with bill creation
      const postData = {
        customerName,
        products: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: total,
        cgst,
        sgst,
        total: finalTotal,
      };

      const postRes = await axios.post(`${API_BASE}/api/queueBill/`, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!postRes.data || !postRes.data.bill) {
        throw new Error("No bill returned from server");
      }

      const createdBill = postRes.data.bill;

      const getRes = await axios.get(
        `${API_BASE}/api/queueBill/${createdBill.billNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const bill = getRes.data?.bill ?? createdBill;
      setBillData(bill);
      setShowCustomerPopup(false);
      setQrVisible(true);
    } catch (error) {
      console.error("Billing error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Unable to process bill. Please try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = async (e) => {
    const value = e.target.value;
    setCustomerName(value);
    setWelcomeMsg(""); // reset welcome message

    if (!value.trim()) return;

    try {
      const token = getAuthToken(); // optional, if your /customer route is protected
      const res = await axios.get(
        `${API_BASE}/api/queueBill/customer/${encodeURIComponent(value)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.data.exists) {
        setWelcomeMsg(`👋 Welcome back, ${res.data.customerName || value}!`);
      }
    } catch (err) {
      console.error("Error checking customer:", err);
    }
  };

  return (
    <aside className="POS-order-summary">
      <h2 className="POS-order-title">Order Summary</h2>

      {items.length === 0 ? (
        <p>No items added yet.</p>
      ) : (
        <ul className="SideOrderSummary-list">
          {items.map((item) => (
            <li key={item.id ?? item.name} className="SideOrderSummary-card">
              <img
                src={item.image || Default}
                alt={item.name}
                className="SideOrderSummary-img"
              />

              <div className="SideOrderSummary-details">
                <p className="SideOrderSummary-name">{item.name}</p>

                <div className="SideOrderSummary-quantity">
                  <button
                    onClick={() => handleDecrease(item)}
                    className="SideOrderSummary-btn"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleIncrease(item)}
                    className="SideOrderSummary-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="SideOrderSummary-price">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <hr />
      {/* <p className="POS-total">Total: ₹{total.toFixed(2)}</p> */}
      <div className="POS-summary-lastrow POS-lasttotal">
        <span>Total</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
      <div className="POS-summary-lastrow POS-lasttax">
        <span>CGST (9%)</span>
        <span>₹{(total * 0.09).toFixed(2)}</span>
      </div>
      <div className="POS-summary-lastrow POS-lasttax">
        <span>SGST (9%)</span>
        <span>₹{(total * 0.09).toFixed(2)}</span>
      </div>
      <hr />
      <div className="POS-summary-lastrow POS-subtotal">
        <span>Subtotal</span>
        <span>₹{(total + total * 0.09 + total * 0.09).toFixed(2)}</span>
      </div>

      <div className="POS-button-group">
        <button
          className="POS-order-btn"
          onClick={handleProceed}
          disabled={loading || items.length === 0}
        >
          {loading ? "Processing..." : "Proceed"}
        </button>
        <button
          className="POS-order-btn"
          onClick={() => alert("Update logic here")}
          disabled={loading}
        >
          Update
        </button>
      </div>

      {showCustomerPopup && (
        <div className="POS-popup-overlay">
          <div className="POS-popup-content">
            
            {welcomeMsg && <p className="POS-welcome-msg">{welcomeMsg}</p>}
            <h3>Enter Customer Name / Phone Number</h3>
            <input
              type="text"
              className="POS-customer-input"
              placeholder="Enter here..."
              value={customerName}
              onChange={handleCustomerChange}
            />

            <div className="POS-popup-buttons">
              <button onClick={() => setShowCustomerPopup(false)}>
                Cancel
              </button>
              <button onClick={confirmAndProceed}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {qrVisible && billData && (
        <div className="POS-qr-modal">
          <div className="POS-qr-popup">
            <div className="POS-header-info">
              <h2 className="POS-header-title">HALDIRAM PRODUCTS PVT. LTD.</h2>
              <p className="POS-header-branch">Haldiram Connaught Place</p>
              <p className="POS-header-address">
                6, L Block, Outer Circle, Connaught Place, New Delhi-110001
              </p>
              <p className="POS-header-contact">Phone No.: 011-47685300</p>
              <p className="POS-header-gst">GST NO.: 07AAACH8461R1ZX</p>
              <p className="POS-header-fssai">FSSAI No.: 10015011002453</p>
              <p className="POS-header-cin">CIN No.: U15490HR1996PTC119135</p>
              <p className="POS-header-reg">
                Reg. Off. Village Kherki Daula, Delhi Jaipur Highway,
                Gurugram-122001
              </p>
              <p className="POS-header-website">Website: www.haldiram.com</p>
            </div>

            <h3 className="POS-qr-title">Scan to View Bill</h3>

            <QRCode
              value={`${
                process.env.REACT_APP_WEB_BASE || "http://localhost:3000"
              }/bill/${billData.billNumber}`}
              size={200}
              qrStyle="dots"
              logoWidth={40}
              eyeRadius={5}
            />

            <div className="POS-invoice-preview">
              <h4>Invoice Summary</h4>
              <table className="POS-invoice-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(billData.products) &&
                    billData.products.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  <tr>
                    <td colSpan="3">
                      <strong>CGST</strong>
                    </td>
                    <td>
                      <strong>
                        ₹{Number(billData.total * 0.09).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3">
                      <strong>SGST</strong>
                    </td>
                    <td>
                      <strong>
                        ₹{Number(billData.total * 0.09).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                  <tr className="POS-total-row">
                    <td colSpan="3">
                      <strong>Total</strong>
                    </td>
                    <td>
                      <strong>₹{Number(billData.total).toFixed(2)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="POS-qr-btn-group">
              <button className="POS-order-btn" onClick={() => window.print()}>
                Proceed / Print
              </button>
              <button
                className="POS-order-btn"
                onClick={() => alert("Bill held for later processing")}
              >
                Hold
              </button>
              <button
                className="POS-order-btn"
                onClick={() => setQrVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default OrderSummary;
