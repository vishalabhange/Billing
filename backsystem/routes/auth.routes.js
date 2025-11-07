const express = require("express");
const router = express.Router();
const { setShopType, register, login } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);

// 🔒 Secure this route with authentication
router.post("/set-shop-type", authenticate, setShopType);

module.exports = router;
