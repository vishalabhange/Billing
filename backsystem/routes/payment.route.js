const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { verifyToken } = require("../middlewares/auth.middleware"); // optional, keep if you want authentication

// Payment Routes
router.post("/order", /* verifyToken, */ paymentController.createOrder);
router.post("/verify", /* verifyToken, */ paymentController.verifyPayment);

// ✅ New: fetch payment history for a bill
router.get("/history/:billNumber", /* verifyToken, */ paymentController.getPaymentHistory);

module.exports = router;
