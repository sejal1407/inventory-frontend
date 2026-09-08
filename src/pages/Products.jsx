import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./Products.css";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Product form
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [categoryId, setCategoryId] = useState("");

  // Edit
  const [editingId, setEditingId] = useState(null);

  // Search
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);

  // Low stock
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockQuantity, setLowStockQuantity] = useState(10);
  const [lowStockLoading, setLowStockLoading] = useState(false);

  // Stock update
  const [stockProductId, setStockProductId] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockUpdating, setStockUpdating] = useState(false);

  // Loading
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);

      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      console.error("LOAD DATA ERROR:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to load products or categories.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Clear form
  const clearForm = () => {
    setName("");
    setSku("");
    setDescription("");
    setPrice("");
    setQuantity("");
    setLowStockThreshold(10);
    setCategoryId("");
    setEditingId(null);
  };

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const productData = {
        name,
        sku,
        description,
        price: Number(price),
        quantity: Number(quantity),
        lowStockThreshold: Number(lowStockThreshold),
        categoryId: Number(categoryId),
      };

      if (editingId === null) {
        await api.post("/products", productData);
        setSuccess("Product added successfully.");
      } else {
        await api.put(`/products/${editingId}`, productData);
        setSuccess("Product updated successfully.");
      }

      clearForm();
      await loadData();
    } catch (err) {
      console.error("PRODUCT SAVE ERROR:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Operation failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Edit
  const handleEdit = (product) => {
    setEditingId(product.id);

    setName(product.name);
    setSku(product.sku);
    setDescription(product.description || "");
    setPrice(product.price);
    setQuantity(product.quantity);
    setLowStockThreshold(product.lowStockThreshold ?? 10);
    setCategoryId(product.category?.id || "");

    setError("");
    setSuccess("");
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/products/${id}`);

      setSuccess("Product deleted successfully.");

      await loadData();
    } catch (err) {
      console.error("DELETE PRODUCT ERROR:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to delete product.");
      }
    }
  };

  // Search
  const handleSearch = async (e) => {
    e.preventDefault();

    const searchValue = searchName.trim();

    if (!searchValue) {
      await loadData();
      return;
    }

    try {
      setSearching(true);
      setError("");
      setSuccess("");

      const response = await api.get(
        `/products/search?name=${encodeURIComponent(searchValue)}`
      );

      setProducts(response.data);

      if (response.data.length === 0) {
        setSuccess("No products found.");
      }
    } catch (err) {
      console.error("SEARCH ERROR:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to search products.");
      }
    } finally {
      setSearching(false);
    }
  };

  // Clear search
  const handleClearSearch = async () => {
    setSearchName("");
    setError("");
    setSuccess("");

    await loadData();
  };

  // Low stock
  const handleLowStock = async () => {
    try {
      setLowStockLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get(
        `/products/low-stock?quantity=${Number(lowStockQuantity)}`
      );

      setLowStockProducts(response.data);

      if (response.data.length === 0) {
        setSuccess("No low-stock products found.");
      }
    } catch (err) {
      console.error("LOW STOCK ERROR:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to load low-stock products.");
      }
    } finally {
      setLowStockLoading(false);
    }
  };

  // Start stock update
  const handleStockEdit = (product) => {
    setStockProductId(product.id);
    setStockQuantity(product.quantity);

    setError("");
    setSuccess("");
  };

  // Cancel stock update
  const cancelStockUpdate = () => {
    setStockProductId(null);
    setStockQuantity("");
  };

  // Update stock
  const handleStockUpdate = async (e) => {
    e.preventDefault();

    if (stockQuantity === "" || Number(stockQuantity) < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    try {
      setStockUpdating(true);
      setError("");
      setSuccess("");

      await api.put(
        `/products/${stockProductId}/stock?quantity=${Number(stockQuantity)}`
      );

      setSuccess("Stock quantity updated successfully.");

      cancelStockUpdate();
      await loadData();
    } catch (err) {
      console.error("STOCK UPDATE ERROR:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to update stock quantity.");
      }
    } finally {
      setStockUpdating(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="products-page">
        <Navbar />

        <div className="products-container">
          <div className="empty-state">
            Loading products...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <Navbar />

      <main className="products-container">

        {/* Page Header */}
        <div className="products-header">
          <div>
            <h1>Products</h1>
            <p>Manage your inventory products</p>
          </div>

          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="message-error">
            {error}
          </div>
        )}

        {success && (
          <div className="message-success">
            {success}
          </div>
        )}

        {/* Search Section */}
        <section className="products-section">
          <h2>Search Products</h2>

          <form
            className="search-form"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search product by name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />

            <button type="submit" disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </button>

            <button
              type="button"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          </form>
        </section>

        {/* Low Stock Section */}
        <section className="products-section">
          <h2>Low Stock Products</h2>

          <form
            className="stock-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLowStock();
            }}
          >
            <label>
              Quantity Threshold:
            </label>

            <input
              type="number"
              min="0"
              value={lowStockQuantity}
              onChange={(e) =>
                setLowStockQuantity(e.target.value)
              }
            />

            <button
              type="submit"
              disabled={lowStockLoading}
            >
              {lowStockLoading
                ? "Checking..."
                : "Check Low Stock"}
            </button>
          </form>

          <br />

          {lowStockProducts.length > 0 ? (
            <div className="products-table-wrapper">
              <table className="products-table low-stock-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Low Stock Threshold</th>
                  </tr>
                </thead>

                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>{product.quantity}</td>
                      <td>{product.lowStockThreshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              No low-stock products displayed.
            </div>
          )}
        </section>

        {/* Add / Edit Product */}
        <section className="products-section">
          <h2>
            {editingId === null
              ? "Add Product"
              : "Edit Product"}
          </h2>

          <form
            className="products-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label>Product Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>SKU</label>

              <input
                type="text"
                value={sku}
                onChange={(e) =>
                  setSku(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Price</label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>

              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Low Stock Threshold</label>

              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) =>
                  setLowStockThreshold(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value)
                }
                required
              >
                <option value="">
                  Select category
                </option>

                {categories
                  .filter(
                    (category) => category.active
                  )
                  .map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId === null
                  ? "Add Product"
                  : "Update Product"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Product List */}
        <section className="products-section">
          <h2>Product List</h2>

          {products.length === 0 ? (
            <div className="empty-state">
              No products found.
            </div>
          ) : (
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>

                      <td>{product.name}</td>

                      <td>{product.sku}</td>

                      <td>₹{product.price}</td>

                      <td>{product.quantity}</td>

                      <td>
                        {product.category?.name || "N/A"}
                      </td>

                      <td>
                        {product.active
                          ? "Active"
                          : "Inactive"}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEdit(product)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(product.id)
                            }
                          >
                            Delete
                          </button>

                          <button
                            className="stock-button"
                            onClick={() =>
                              handleStockEdit(product)
                            }
                          >
                            Update Stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Stock Update Form */}
        {stockProductId !== null && (
          <section className="products-section">
            <h2>Update Stock Quantity</h2>

            <form
              className="stock-form"
              onSubmit={handleStockUpdate}
            >
              <label>New Quantity:</label>

              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) =>
                  setStockQuantity(e.target.value)
                }
                required
              />

              <button
                type="submit"
                disabled={stockUpdating}
              >
                {stockUpdating
                  ? "Updating..."
                  : "Update Stock"}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={cancelStockUpdate}
              >
                Cancel
              </button>
            </form>
          </section>
        )}

      </main>
    </div>
  );
}

export default Products;