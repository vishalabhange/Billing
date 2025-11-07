const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const QueueBill = sequelize.define("QueueBill", {
  billNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  products: {
    type: DataTypes.JSON, // [{ name, quantity, price }]
    allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  Payment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "pending",
  },
  OrderType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "None",
  },

  // new field to tie a bill to a user
  userId: {
    type: DataTypes.STRING, // string to support both numeric ids and UUIDs
    allowNull: true,        // start as nullable so migrations won't fail for existing rows
  },
});

// Optional: association helper — call this from your models/index or wherever you set associations
QueueBill.associate = (models) => {
  if (models.User) {
    QueueBill.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  }
};

module.exports = QueueBill;