import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./inventory.css";

const AddProductPage = ({ showAlert }) => {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    stock_quantity: "",
    unit: "pcs",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    const data = await res.json();

    if (res.status === 409) {
      // ❗ Product exists - ask user to confirm update
      const confirmUpdate = window.confirm(
        "This product already exists. Do you want to increase the quantity?"
      );
      if (confirmUpdate) {
        const updatedQuantity =
          parseInt(data.product.stock_quantity) +
          parseInt(product.stock_quantity);

        // Call backend PUT to update product quantity
        const updateRes = await fetch(
          `http://localhost:5000/api/products/${data.product.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...data.product,
              stock_quantity: updatedQuantity,
            }),
          }
        );

        if (updateRes.ok) {
          showAlert("Product quantity updated!", "success");
          navigate("/items");
        } else {
          showAlert("Failed to update product quantity", "danger");
        }
      }
    } else if (res.ok) {
      showAlert("Product added successfully!", "success");
      navigate("/items");
    } else {
      showAlert(data.message || "Failed to add product", "danger");
    }
  } catch (error) {
    showAlert("Server error!", "danger");
    console.error(error);
  }
};


  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold text-center mb-6">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input"
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          required
        />
        <input
          className="input"
          type="text"
          name="category"
          placeholder="Category"
          value={product.category}
          onChange={handleChange}
        />
        <input
          className="input"
          type="text"
          name="brand"
          placeholder="Brand"
          value={product.brand}
          onChange={handleChange}
        />
        <textarea
          className="input"
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
        ></textarea>
        <input
          className="input"
          type="number"
          step="0.01"
          name="price"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
          required
        />
        <input
          className="input"
          type="number"
          name="stock_quantity"
          placeholder="Stock Quantity"
          value={product.stock_quantity}
          onChange={handleChange}
          required
        />
        <select
          className="input"
          name="unit"
          value={product.unit}
          onChange={handleChange}
        >
          <option value="pcs">pcs</option>
          <option value="kg">kg</option>
          <option value="litre">litre</option>
        </select>
        <button className="button-field w-full" type="submit">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
