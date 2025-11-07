const QueueBill = require("../models/queueBill.model");
const { v4: uuidv4 } = require("uuid");

// helper: owner or admin
const isOwnerOrAdmin = (resourceUserId, currentUser) => {
  if (!currentUser) return false;
  if (currentUser.role && currentUser.role === "admin") return true;
  return String(resourceUserId) === String(currentUser.id);
};

// ✅ New: Check if customer exists
exports.checkCustomerExists = async (req, res) => {
  try {
    const { nameOrNumber } = req.params;

    const existingBill = await QueueBill.findOne({
      where: { customerName: nameOrNumber },
      order: [["createdAt", "DESC"]], // get the latest bill if multiple exist
    });

    if (existingBill) {
      return res.status(200).json({
        exists: true,
        customerName: existingBill.customerName,
      });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("❌ Error checking customer:", err.message);
    return res.status(500).json({ success: false, message: "Error checking customer." });
  }
};

// Create a new bill
exports.createQueueBill = async (req, res) => {
  try {
    let targetUserId = req.user && req.user.id;
    if (req.body.userId && req.user.role === "admin") {
      targetUserId = req.body.userId;
    }

    if (!targetUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { customerName, products, total, Payment, Status, OrderType } = req.body;
    const billNumber = `BILL-${uuidv4().slice(0, 8)}`;
    const date = new Date().toISOString().split("T")[0];

    const newBill = await QueueBill.create({
      billNumber,
      customerName,
      products,
      total,
      date,
      Payment,
      Status,
      OrderType,
      userId: targetUserId,
    });

    return res.status(201).json({ success: true, bill: newBill });
  } catch (err) {
    console.error("❌ Error creating bill:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get bill by bill number
exports.getBillByNumber = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await QueueBill.findOne({ where: { billNumber } });

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    if (req.user) {
      if (!isOwnerOrAdmin(bill.userId, req.user)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    return res.status(200).json({ success: true, bill });
  } catch (err) {
    console.error("❌ Error fetching bill:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const where = {};
    if (req.query.userId && req.user.role === "admin") {
      where.userId = req.query.userId;
    } else if (!(req.user.role && req.user.role === "admin")) {
      where.userId = req.user.id;
    }

    const bills = await QueueBill.findAll({ where });
    return res.status(200).json({ success: true, bills });
  } catch (err) {
    console.error("❌ Error fetching bills:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete bill
exports.deleteQueueBill = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await QueueBill.findOne({ where: { billNumber } });

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    if (!isOwnerOrAdmin(bill.userId, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await QueueBill.destroy({ where: { billNumber } });
    return res.status(200).json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting bill:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update bill
exports.updateQueueBill = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await QueueBill.findOne({ where: { billNumber } });

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    const [updated] = await QueueBill.update(req.body, { where: { billNumber } });

    if (updated === 0) {
      return res.status(400).json({ success: false, message: "No changes made" });
    }

    const updatedBill = await QueueBill.findOne({ where: { billNumber } });
    return res.status(200).json({ success: true, bill: updatedBill });
  } catch (error) {
    console.error("❌ Error updating bill:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
