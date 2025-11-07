import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./OrderList.css";
import POSNavbar from "../POSHome/POSNavbar";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const WEB_BASE = process.env.REACT_APP_WEB_BASE || "http://localhost:3000";
const TOKEN_KEY = "authToken";

const COLORS = ["#4CAF50", "#FFC107", "#F44336", "#2196F3"];

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

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

    if (dateFilter !== "All" && dateFilter !== "Pickup List") {
      const today = new Date();
      let startDate = null;
      switch (dateFilter) {
        case "Today":
          startDate = new Date(today.setHours(0, 0, 0, 0));
          break;
        case "Yesterday":
          startDate = new Date(today.setDate(today.getDate() - 1));
          startDate.setHours(0, 0, 0, 0);
          break;
        case "This Week":
          startDate = new Date(today.setDate(today.getDate() - today.getDay()));
          startDate.setHours(0, 0, 0, 0);
          break;
        case "Last Week":
          startDate = new Date(
            today.setDate(today.getDate() - (today.getDay() + 7))
          );
          startDate.setHours(0, 0, 0, 0);
          break;
        case "This Month":
          startDate = new Date(today.setDate(1));
          startDate.setHours(0, 0, 0, 0);
          break;
        case "Last Month":
          startDate = new Date(today.setMonth(today.getMonth() - 1));
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          break;
      }

      filteredList = filteredList.filter(
        (order) => new Date(order.date) >= startDate
      );
    }

    setFiltered(filteredList);
  }, [statusFilter, typeFilter, orders, dateFilter]);

  // --- Dashboard summary ---
  const totalOrders = filtered.length;
  const pendingOrders = filtered.filter(
    (o) => o.Status?.toLowerCase() === "pending"
  ).length;
  const completedOrders = filtered.filter(
    (o) => o.Status?.toLowerCase() === "complete"
  ).length;
  const holdOrders = filtered.filter(
    (o) => o.Status?.toLowerCase() === "hold"
  ).length;
  const todayOrders = filtered.filter(
    (o) => new Date(o.date).toDateString() === new Date().toDateString()
  ).length;

  // ✅ Calculate total sum of order totals
  const totalAmount = filtered.reduce(
    (sum, order) => sum + (parseFloat(order.total) || 0),
    0
  );

  const chartData = [
    { name: "Completed", value: completedOrders },
    { name: "Pending", value: pendingOrders },
    { name: "Hold", value: holdOrders },
    { name: "Total", value: totalOrders },
  ];

  if (loading) return <p className="orders-loading">Loading orders...</p>;

  return (
    <>
      <POSNavbar />
      <div className="OrderList">
        {/* Dashboard Chart + Financial Graph */}
        <div className="OrderList-dashboard">
          <div className="OrderList-chart-box">
            <h3>Order Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="OrderList-financial-details">
              <div className="OrderList-total-box">
                <h4>Total Orders</h4>
                <p className="total-amount">
                  {totalOrders}
                </p>
              </div>
              <div className="OrderList-total-box">
                <h4>Complete Orders</h4>
                <p className="total-amount">{completedOrders}</p>
              </div>
              <div className="OrderList-total-box">
                <h4>Pending Orders</h4>
                <p className="total-amount">
                  {pendingOrders}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Financial Summary Graph */}
          <div className="OrderList-financial-box">
            <h3>Financial Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Total Investment", value: totalAmount * 0.82 },
                    { name: "Total Profit", value: totalAmount * 0.18 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#2196F3" /> {/* Investment */}
                  <Cell fill="#4CAF50" /> {/* Profit */}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="OrderList-financial-details">
              <div className="OrderList-total-box">
                <h4>Total Investment</h4>
                <p className="total-amount">
                  ₹{(totalAmount * 0.82).toFixed(2)}
                </p>
              </div>
              <div className="OrderList-total-box">
                <h4>Total Sales</h4>
                <p className="total-amount">₹{totalAmount.toFixed(2)}</p>
              </div>
              <div className="OrderList-total-box">
                <h4>Total Profit</h4>
                <p className="total-amount">
                  ₹{(totalAmount * 0.18).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards — Single Horizontal Card */}
<div className="OrderList-summary-horizontal">
  <div className="summary-item">
    <h4>Total Orders</h4>
    <p>{totalOrders}</p>
  </div>
  <div className="summary-item">
    <h4>Today</h4>
    <p>{todayOrders}</p>
  </div>
  <div className="summary-item">
    <h4>Pending</h4>
    <p>{pendingOrders}</p>
  </div>
  <div className="summary-item">
    <h4>Completed</h4>
    <p>{completedOrders}</p>
  </div>
  <div className="summary-item">
    <h4>Hold</h4>
    <p>{holdOrders}</p>
  </div>
</div>


        {/* Filter Bar */}
        <div className="OrderList-filter-bar">
          <div className="filter-group search-full">
            <input
              type="text"
              placeholder="Search by Bill Number..."
              onChange={(e) => {
                const searchValue = e.target.value.toLowerCase();
                const filteredList = orders.filter((order) =>
                  String(order.billNumber).toLowerCase().includes(searchValue)
                );
                setFiltered(filteredList);
              }}
            />
          </div>

          <div className="OrderList-date-filter">
            {[
              "All",
              "Today",
              "Yesterday",
              "This Week",
              "Last Week",
              "This Month",
              "Last Month",
              "Pickup List",
            ].map((option) => (
              <button
                key={option}
                className={`date-filter-btn ${
                  dateFilter === option ? "active" : ""
                }`}
                onClick={() => setDateFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="OrderList-controls">
          <div className="OrderList-filters">
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>pending</option>
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

        {error && <p className="orders-error">{error}</p>}

        {/* Desktop Table */}
        <div className="OrderList-table-wrapper">
          <h2 className="OrderList-title">Order History</h2>
          <table className="OrderList-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Date</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Order Type</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id || order.billNumber}>
                  <td>{order.billNumber}</td>
                  <td>
                    {order.date
                      ? new Date(order.date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    {typeof order.total === "number"
                      ? order.total.toFixed(2)
                      : order.total}
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${String(
                        order.Status || ""
                      ).toLowerCase()}`}
                    >
                      {order.Status}
                    </span>
                  </td>
                  <td>
                    <span className="ordertype-badge">{order.OrderType}</span>
                  </td>
                  <td>
                    <a
                      href={`${WEB_BASE}/bill/${order.billNumber}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="OrderList-cards">
          {filtered.map((order) => (
            <div className="order-card" key={order.id || order.billNumber}>
              <div className="card-row">
                <span className="label">Bill:</span>
                <span>{order.billNumber}</span>
              </div>
              <div className="card-row">
                <span className="label">Date:</span>
                <span>
                  {order.date ? new Date(order.date).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="card-row">
                <span className="label">Total:</span>
                <span>₹{order.total}</span>
              </div>
              <div className="card-row">
                <span className="label">Status:</span>
                <span
                  className={`status-badge status-${String(
                    order.Status || ""
                  ).toLowerCase()}`}
                >
                  {order.Status}
                </span>
              </div>
              <div className="card-row">
                <span className="label">Type:</span>
                <span className="ordertype-badge">{order.OrderType}</span>
              </div>
              <div className="card-row">
                <a
                  href={`${WEB_BASE}/bill/${order.billNumber}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Bill
                </a>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !error && (
          <p className="no-orders">You have no orders yet.</p>
        )}
      </div>
    </>
  );
};

export default OrderList;
