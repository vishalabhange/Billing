const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your Sequelize instance

const PaymentHistory = sequelize.define("PaymentHistory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  billNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  razorpayOrderId: DataTypes.STRING,
  razorpayPaymentId: DataTypes.STRING,
  razorpaySignature: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM("Success", "Failed"),
    defaultValue: "Failed",
  },
  attemptAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "PaymentHistory",
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

module.exports = PaymentHistory;
