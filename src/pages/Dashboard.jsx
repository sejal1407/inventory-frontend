import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

function Dashboard() {

    // =====================================================
    // GET CURRENT USER
    // =====================================================

    const userData = localStorage.getItem("user");

    let user = null;

    try {
        user = userData
            ? JSON.parse(userData)
            : null;
    } catch (error) {
        console.error(
            "Error parsing user:",
            error
        );
    }

    const isAdmin =
        user?.email === "test@gmail.com";


    return (
        <>
            <Navbar />

            <main className="dashboard-page">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <section className="dashboard-header">

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Welcome to your inventory management workspace.
                    </p>

                </section>


                {/* =================================================
                    INVENTORY OVERVIEW
                ================================================= */}

                <section className="dashboard-welcome-card">

                    <div className="welcome-accent"></div>

                    <div className="welcome-content">

                        <div className="welcome-icon">
                            ✦
                        </div>

                        <div className="welcome-text">

                            <h2>
                                Inventory Overview
                            </h2>

                            <p>
                                View and manage your inventory,
                                products, and categories from one place.
                            </p>

                            <span className="role-badge">
                                {isAdmin
                                    ? "Administrator"
                                    : "User"}
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section className="quick-actions-section">

                    <div className="section-heading">

                        <h2>
                            Quick Actions
                        </h2>

                        <p>
                            Get started with your inventory.
                        </p>

                    </div>


                    <div className="quick-actions-grid">

                        {/* =========================================
                            ADD PRODUCT
                        ========================================== */}

                        <Link
                            to="/products?mode=add"
                            className="action-card product-action"
                        >

                            <div className="action-icon product-icon">
                                +
                            </div>

                            <h3>
                                Add Product
                            </h3>

                            <p>
                                Create a new product and add it
                                to your inventory.
                            </p>

                            <span className="action-link">
                                Add a product →
                            </span>

                        </Link>


                        {/* =========================================
                            ADD CATEGORY
                        ========================================== */}

                        <Link
                            to="/categories?mode=add"
                            className="action-card category-action"
                        >

                            <div className="action-icon category-icon">
                                #
                            </div>

                            <h3>
                                Add Category
                            </h3>

                            <p>
                                Create a new category and organize
                                your products.
                            </p>

                            <span className="action-link">
                                Add a category →
                            </span>

                        </Link>

                    </div>

                </section>

            </main>
        </>
    );
}

export default Dashboard;