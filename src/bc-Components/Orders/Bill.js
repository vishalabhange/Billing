import React, { useEffect, useState } from "react";
import axios from "axios";
import POSNavbar from "../POSHome/POSNavbar";
import "./Bills.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const TOKEN_KEY = "authToken";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = () => localStorage.getItem(TOKEN_KEY) || null;

  const parseJwt = (token) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
      return null;
    }
  };

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("You must be logged in to view bills.");
        setBills([]);
        setLoading(false);
        return;
      }

      const payload = parseJwt(token);
      const currentUserId = payload?.id || payload?.userId || null;

      const res = await axios.get(`${API_BASE}/api/queueBill/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allBills = Array.isArray(res.data?.bills) ? res.data.bills : [];
      const visibleBills = currentUserId
        ? allBills.filter((b) => String(b.userId || "") === String(currentUserId))
        : allBills;

      setBills(visibleBills);
    } catch (e) {
      console.error("Failed to fetch bills:", e);
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        "Failed to fetch bills";
      setError(msg);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  if (loading) return <p className="bills-loading">Loading bills...</p>;
  if (error) return <p className="bills-error">{error}</p>;

  return (
    <>
      <POSNavbar />
      <div className="BillsPage">
        <h2 className="BillsPage-title">All Bills</h2>

        {bills.length === 0 ? (
          <p className="no-bills">No bills found.</p>
        ) : (
          <div className="BillsGrid">
            {bills.map((bill) => (
              <div className="BillCard" key={bill.id || bill.billNumber}>
                <div className="BillCard-header">
                  <h3>Bill #{bill.billNumber}</h3>
                  <p className="BillCard-date">
                    {bill.date
                      ? new Date(bill.date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div className="BillCard-info">
                  <p><strong>Customer:</strong> {bill.customerName || "—"}</p>
                  <p><strong>Order Type:</strong> {bill.OrderType || "—"}</p>
                  <p><strong>Status:</strong> {bill.Status || "—"}</p>
                </div>

                <div className="BillCard-products">
                  <h4>Products</h4>
                  {bill.Products && bill.Products.length > 0 ? (
                    <table className="BillProducts-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Price (₹)</th>
                          <th>Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.Products.map((prod, i) => (
                          <tr key={i}>
                            <td>{prod.name}</td>
                            <td>{prod.quantity}</td>
                            <td>{prod.price}</td>
                            <td>{(prod.price * prod.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-products">No products in this bill.</p>
                  )}
                </div>

                <div className="BillCard-footer">
                  <p className="BillCard-total">
                    <strong>Total:</strong> ₹
                    {bill.total
                      ? parseFloat(bill.total).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Bills;
