// routes/cart.routes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.post("/validate-stock", async (req, res) => {
  const { productId, requestedQuantity } = req.body;

  try {
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (requestedQuantity > product.quantity) {
      return res.status(400).json({ error: "Quantity exceeds stock!" });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
