const express = require("express");
const router = express.Router();

const {
  createQueueBill,
  getAllBills,
  getBillByNumber,
  deleteQueueBill,
  updateQueueBill,
  checkCustomerExists, // ✅ import the new controller
} = require("../controllers/queueBill.controller");

const { authenticate, authorize } = require("../middlewares/auth.middleware");

// protected routes: user must be authenticated
router.post("/", authenticate, createQueueBill);
router.get("/", authenticate, getAllBills);
router.get("/:billNumber", getBillByNumber);
router.delete("/:billNumber", authenticate, deleteQueueBill);
router.put("/:billNumber", updateQueueBill);

// ✅ New route to check if customer exists
router.get("/customer/:nameOrNumber", checkCustomerExists);

module.exports = router;
