const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/admin", authenticate, authorize(["admin"]), (req, res) => {
  res.json({ message: "Welcome Admin", user: req.user });
});

router.get("/user", authenticate, authorize(["user", "admin"]), (req, res) => {
  res.json({ message: "Welcome User", user: req.user });
});

module.exports = router;
