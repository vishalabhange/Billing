// BillDetaile.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./BillDetaile.css";

const BillDetaile = () => {
  const { billNumber } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState("");
  const [updatingType, setUpdatingType] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Load Razorpay checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Fetch bill and payment history
  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/queueBill/${billNumber}`
        );
        setBill(res.data.bill);
        setOrderType(res.data.bill.OrderType || "Not Selected");
      } catch (error) {
        console.error("Failed to fetch bill:", error);
      } finally {
        setLoading(false);
      }

      fetchPaymentHistory();
    };

    const fetchPaymentHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/payment/history/${billNumber}`
        );
        setPaymentHistory(res.data.history);
      } catch (err) {
        console.error("Failed to fetch payment history:", err);
      }
    };

    fetchBill();
  }, [billNumber]);

  // Handle Razorpay payment
  const handlePayment = async () => {
    if (!bill) return;

    setPaymentProcessing(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("❌ Razorpay SDK failed to load. Check your connection.");
      setPaymentProcessing(false);
      return;
    }

    try {
      // 1️⃣ Create order on backend
      const { data: order } = await axios.post(
        "http://localhost:5000/api/payment/order",
        {
          amount: bill.total,
          billNumber: bill.billNumber,
        }
      );

      // 2️⃣ Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "My Store",
        description: `Payment for Bill ${bill.billNumber}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3️⃣ Verify payment backend
            await axios.post("http://localhost:5000/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              billNumber: bill.billNumber,
            });

            // 4️⃣ Fetch updated bill & history
            const updatedBill = await axios.get(
              `http://localhost:5000/api/queueBill/${bill.billNumber}`
            );
            setBill(updatedBill.data.bill);

            const updatedHistory = await axios.get(
              `http://localhost:5000/api/payment/history/${bill.billNumber}`
            );
            setPaymentHistory(updatedHistory.data.history);

            alert("✅ Payment successful!");
          } catch (err) {
            console.error("Payment verification failed:", err);

            // Refresh history even if failed
            const updatedHistory = await axios.get(
              `http://localhost:5000/api/payment/history/${bill.billNumber}`
            );
            setPaymentHistory(updatedHistory.data.history);

            alert("❌ Payment verification failed. You can retry.");
          }
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed:", err);
      alert("❌ Payment failed.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Update Order Type
  const updateOrderType = async () => {
    try {
      setUpdatingType(true);
      await axios.put(`http://localhost:5000/api/queueBill/${billNumber}`, {
        OrderType: orderType,
      });
      setBill((prev) => ({ ...prev, OrderType: orderType }));
      alert("✅ Order type updated successfully.");
    } catch (error) {
      console.error("Error updating order type:", error);
      alert("❌ Failed to update order type.");
    } finally {
      setUpdatingType(false);
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!bill) return <p className="error-text">Bill not found.</p>;

  return (
    <div className="bill-detail-container">
      <div className="bill-header">
        <h1>Invoice Summary</h1>
        <p>
          Bill Number: <strong>{bill.billNumber}</strong>
        </p>
        <p>
          Date Issued: <strong>{new Date(bill.date).toLocaleString()}</strong>
        </p>
        <p>
          Status: <strong>{bill.Status}</strong>
        </p>
      </div>

      <table className="bill-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price (₹)</th>
            <th>Subtotal (₹)</th>
          </tr>
        </thead>
        <tbody>
          {bill.products.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.price.toFixed(2)}</td>
              <td>{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
          <tr className="bill-total-row">
            <td colSpan="3" className="text-right">
              <strong>Total</strong>
            </td>
            <td>
              <strong>₹{bill.total.toFixed(2)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="update-controls-container">
        <div className="update-box">
          <label>
            <strong>Status:</strong>
          </label>
          <p>{bill.Status}</p>
          {bill.Status !== "Complete" && (
            <button
              className="status-update-btn"
              onClick={handlePayment}
              disabled={paymentProcessing}
            >
              {paymentProcessing ? "Processing..." : "Pay Now 💳"}
            </button>
          )}
        </div>

        <div className="update-box">
          <label htmlFor="orderTypeDropdown">
            <strong>Order Type:</strong>
          </label>
          <select
            id="orderTypeDropdown"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            <option value="Not Selected">Not Selected</option>
            <option value="Self">Self</option>
            <option value="Parcel">Parcel</option>
            <option value="Dine-In">Dine-In</option>
          </select>
          <button
            className="status-update-btn"
            onClick={updateOrderType}
            disabled={updatingType}
          >
            {updatingType ? "Updating..." : "OK"}
          </button>
        </div>
      </div>

      <div className="payment-history">
        <h3>Payment History</h3>
        {paymentHistory.length === 0 ? (
          <p>No attempts yet.</p>
        ) : (
          <ul>
            {paymentHistory.map((p) => (
              <li key={p.id}>
                {new Date(p.attemptAt).toLocaleString()} — {p.status}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="footer-note">
        <p>Thank you for your purchase!</p>
      </div>
    </div>
  );
};

export default BillDetaile;
