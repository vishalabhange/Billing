// models/ProTemplates/templateGeneralProduct.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const GeneralTemplate = sequelize.define(
  "GeneralTemplate",
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
    tableName: "product_templates_general",
    timestamps: false,
  }
);

module.exports = GeneralTemplate;
