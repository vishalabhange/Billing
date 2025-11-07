import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderList.css";
import POSNavbar from "../POSHome/POSNavbar";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const TOKEN_KEY = "authToken";

const History = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const getAuthToken = () => localStorage.getItem(TOKEN_KEY) || null;

  const parseJwt = (token) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
      return null;
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("You must be logged in to view orders.");
        setOrders([]);
        setFiltered([]);
        setLoading(false);
        return;
      }

      const payload = parseJwt(token);
      const currentUserId = payload?.id || payload?.userId || null;

      const res = await axios.get(`${API_BASE}/api/queueBill/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bills = Array.isArray(res.data?.bills) ? res.data.bills : [];
      const visibleBills = currentUserId
        ? bills.filter((b) => String(b.userId || "") === String(currentUserId))
        : bills;

      setOrders(visibleBills);
      setFiltered(visibleBills);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        "Failed to fetch orders";
      setError(msg);
      setOrders([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filteredList = [...orders];

    if (statusFilter !== "All") {
      filteredList = filteredList.filter(
        (o) =>
          String(o.Status || "").toLowerCase() ===
          String(statusFilter).toLowerCase()
      );
    }

    if (typeFilter !== "All") {
      filteredList = filteredList.filter(
        (o) =>
          String(o.OrderType || "").toLowerCase() ===
          String(typeFilter).toLowerCase()
      );
    }

    setFiltered(filteredList);
  }, [statusFilter, typeFilter, orders]);

  if (loading) return <p className="orders-loading">Loading orders...</p>;

  return (
    <>
      <POSNavbar />
      <div className="OrderList">
        {/* Filters & Refresh */}
        <div className="OrderList-controls">
          <div className="OrderList-filters">
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Pending</option>
                <option>Complete</option>
                <option>Hold</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Order Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option>All</option>
                <option>None</option>
                <option>Self</option>
                <option>Parcel</option>
                <option>Dine-In</option>
              </select>
            </div>
          </div>

          <div className="OrderList-actions">
            <button
              className="OrderList-refresh-btn"
              onClick={() => fetchOrders()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Orders Table */}
        {error && <p className="orders-error">{error}</p>}

        <div className="OrderList-table-wrapper">
          <h2 className="OrderList-title">Order History</h2>
          <table className="OrderList-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill Number</th>
                <th>Customer Name/PhoneNo</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Order Type</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id || order.billNumber}>
                  <td>
                    {order.date
                      ? new Date(order.date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{order.billNumber}</td>
                  <td>{order.customerName}</td>
                  <td>
                    {typeof order.total === "number"
                      ? order.total.toFixed(2)
                      : order.total}
                  </td>
                  <td>{order.Status}</td>
                  <td>{order.OrderType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !error && (
          <p className="no-orders">No orders found.</p>
        )}
      </div>
    </>
  );
};

export default History;
