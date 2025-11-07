const Product = require("../models/Product");
const User = require("../models/User");

// Create a new product (only if user has selected shop_type)
exports.createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, brand, price, category } = req.body;

    const user = await User.findByPk(userId);
    if (!user || !user.shop_type) {
      return res.status(400).json({ error: "Please select shop type before adding products" });
    }

    const existingProduct = await Product.findOne({ where: { name, brand, userId } });

    if (existingProduct) {
      return res.status(409).json({
        message: "Product already exists",
        product: existingProduct,
      });
    }

    const product = await Product.create({
      name,
      brand,
      price,
      category,
      userId,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products for current user
exports.getAllProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const products = await Product.findAll({ where: { userId } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const userId = req.user.id;
    const product = await Product.findOne({ where: { id: req.params.id, userId } });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product (must belong to user)
exports.updateProduct = async (req, res) => {
  try {
    const userId = req.user.id;

    const product = await Product.findOne({ where: { id: req.params.id, userId } });
    if (!product) return res.status(404).json({ message: "Product not found or not yours" });

    await product.update(req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a product (must belong to user)
exports.deleteProduct = async (req, res) => {
  try {
    const userId = req.user.id;

    const product = await Product.findOne({ where: { id: req.params.id, userId } });
    if (!product) return res.status(404).json({ message: "Product not found or not yours" });

    await product.destroy();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
