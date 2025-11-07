const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const GeneralTemplate = require("../models/ProTemplates/templateGeneralProduct");
const SweetTemplate = require("../models/ProTemplates/templateSweetProduct");
const Product = require("../models/Product");

// Register a new user — now returns a token so frontend can proceed immediately
const register = async (req, res) => {
  const { name, email, password, role = "user" } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shop_type: user.shop_type || null,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shop_type: user.shop_type || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Set shop type (can only be done once)
const setShopType = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Session expired, please log in again" });
    }

    const userId = req.user.id;
    const { shop_type } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.shop_type) {
      return res.status(400).json({ message: "Shop type already selected" });
    }

    if (!["general", "sweet"].includes(shop_type)) {
      return res.status(400).json({ message: "Invalid shop type" });
    }

    user.shop_type = shop_type;
    await user.save();

    let templateProducts = [];
    if (shop_type === "general") {
      templateProducts = await GeneralTemplate.findAll();
    } else if (shop_type === "sweet") {
      templateProducts = await SweetTemplate.findAll();
    }

    if (!templateProducts || templateProducts.length === 0) {
      return res.status(404).json({ message: "No template products found" });
    }

    // ✅ Create products for this user without copying template `id`
    const newProducts = templateProducts.map((item) => ({
      name: item.name,
      category: item.category,
      brand: item.brand || null,
      description: item.description || null,
      price: item.price,
      stock_quantity: item.stock_quantity || 0,
      unit: item.unit || "pcs",
      userId: userId, // ✅ assign logged-in user id
    }));

    await Product.bulkCreate(newProducts);

    res.status(200).json({
      message: "Shop type set and template products copied for this user",
    });
  } catch (error) {
    console.error("setShopType error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

module.exports = {
  register,
  login,
  setShopType,
};
