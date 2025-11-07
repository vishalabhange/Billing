const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
  type: DataTypes.INTEGER,
  allowNull: false,
},
  category: DataTypes.STRING,
  brand: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: "pcs",
  },
});

module.exports = Product;
