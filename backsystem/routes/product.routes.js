const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

// Optional: if you want auth control
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// Public for authenticated users
router.get("/", authenticate, productController.getAllProducts);
router.get("/:id", authenticate, productController.getProductById);

// Allow any authenticated user to create products (after shop type is set)
router.post("/", authenticate, productController.createProduct);

// Allow any authenticated user to update/delete their own products
router.put("/:id", authenticate, productController.updateProduct);
router.delete("/:id", authenticate, productController.deleteProduct);


module.exports = router;
