const Razorpay = require("razorpay");
const crypto = require("crypto");
const QueueBill = require("../models/queueBill.model");
const PaymentHistory = require("../models/PaymentHistory"); 

// Use backend keys from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount, billNumber } = req.body;

    if (!amount || !billNumber) {
      return res.status(400).json({ error: "Amount or Bill Number missing" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: billNumber,
    });

    res.json(order);
  } catch (err) {
    console.error("❌ Razorpay order creation error:", err);
    res.status(500).json({ error: err.error?.description || err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billNumber } = req.body;

    if (!billNumber || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment data" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const status = expectedSignature === razorpay_signature ? "Success" : "Failed";

    // Log payment attempt first
    // await PaymentHistory.create({
    //   billNumber,
    //   razorpayOrderId: razorpay_order_id,
    //   razorpayPaymentId: razorpay_payment_id,
    //   razorpaySignature: razorpay_signature,
    //   status,
    //   attemptAt: new Date(),
    // });
    // After verifying with Razorpay signature
await PaymentHistory.create({
  billNumber: req.body.billNumber,
  razorpayOrderId: req.body.razorpay_order_id,
  razorpayPaymentId: req.body.razorpay_payment_id,
  razorpaySignature: req.body.razorpay_signature,
  status: 'Success',
});


    if (status === "Success") {
      await QueueBill.update(
        { Status: "Complete", Payment: "Paid" },
        { where: { billNumber } }
      );
      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("❌ Payment verification error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const { billNumber } = req.params;

    const history = await PaymentHistory.findAll({
      where: { billNumber },
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, history });
  } catch (err) {
    console.error("❌ Error fetching payment history:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
