const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const sequelize = require("./config/db");
require("./models/User"); // Ensure model is imported to sync

const paymentRoutes = require("./routes/payment.route");

// ✅ Enable CORS before routes
app.use(cors({
  origin: "http://localhost:3000", // Your React app URL
  credentials: true
}));

// ✅ Enable JSON body parsing
app.use(express.json());

// ✅ Sync database models
sequelize.sync({ alter: true }).then(() => {
  console.log("✅ DB Synced");
}).catch((err) => {
  console.error("❌ DB Sync Error:", err);
});

// ✅ Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/protected", require("./routes/protected.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/queueBill", require("./routes/queueBill.routes"));

app.use("/api/payment", paymentRoutes);




module.exports = app;
