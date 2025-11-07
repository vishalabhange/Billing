// models/ProTemplates/templateSweetProduct.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SweetTemplate = sequelize.define(
  "SweetTemplate",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    category: DataTypes.STRING,
    brand: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: { type: DataTypes.FLOAT, allowNull: false },
    stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    unit: { type: DataTypes.STRING, defaultValue: "pcs" },
  },
  {
    tableName: "product_templates_sweet",
    timestamps: false,
  }
);

module.exports = SweetTemplate;
