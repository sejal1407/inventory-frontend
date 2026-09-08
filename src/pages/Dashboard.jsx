import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError("");

      let hasError = false;

      try {
        const productsResponse = await api.get("/products");
        setProductCount(productsResponse.data.length);
      } catch (err) {
        console.error("PRODUCT COUNT ERROR:", err);
        hasError = true;
      }

      try {
        const categoriesResponse = await api.get("/categories");
        setCategoryCount(categoriesResponse.data.length);
      } catch (err) {
        console.error("CATEGORY COUNT ERROR:", err);
        hasError = true;
      }

      try {
        const lowStockResponse = await api.get(
          "/products/low-stock?quantity=10"
        );
        setLowStockCount(lowStockResponse.data.length);
      } catch (err) {
        console.error("LOW STOCK COUNT ERROR:", err);
        hasError = true;
      }

      if (hasError) {
        setError("Some dashboard data could not be loaded.");
      }

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />

        <main className="dashboard-container">
          <div className="dashboard-loading">
            Loading dashboard...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container">
        {/* Page Heading */}
        <div className="dashboard-heading">
          <h1>Dashboard</h1>
          <p>Inventory overview and quick actions</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="dashboard-cards">

          {/* Products Card */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/products")}
          >
            <div className="card-icon">📦</div>

            <p className="card-label">
              Total Products
            </p>

            <h2>{productCount}</h2>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/products");
              }}
            >
              View Products
            </button>
          </div>

          {/* Categories Card */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/categories")}
          >
            <div className="card-icon">🏷️</div>

            <p className="card-label">
              Total Categories
            </p>

            <h2>{categoryCount}</h2>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/categories");
              }}
            >
              View Categories
            </button>
          </div>

          {/* Low Stock Card */}
          <div
            className="dashboard-card low-stock-card"
            onClick={() => navigate("/products")}
          >
            <div className="card-icon">⚠️</div>

            <p className="card-label">
              Low Stock Products
            </p>

            <h2>{lowStockCount}</h2>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/products");
              }}
            >
              Check Stock
            </button>
          </div>

        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>

          <div className="action-buttons">
            <button
              onClick={() => navigate("/products")}
            >
              📦 Manage Products
            </button>

            <button
              onClick={() => navigate("/categories")}
            >
              🏷️ Manage Categories
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;