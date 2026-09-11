import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  /* ==========================================
     LOGOUT BUTTON CLICK
     ========================================== */

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  /* ==========================================
     STAY BUTTON
     ========================================== */

  const handleStay = () => {
    setShowLogoutModal(false);
  };

  /* ==========================================
     CONFIRM LOGOUT
     ========================================== */

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setShowLogoutModal(false);

    navigate("/login");
  };

  return (
    <>
      {/* ==========================================
          NAVBAR
         ========================================== */}

      <nav className="navbar">

        {/* BRAND */}

        <div className="navbar-brand">
          Inventory Management
        </div>

        {/* ========================================
            NAVIGATION LINKS
           ======================================== */}

        <div className="navbar-links">

          {/* DASHBOARD */}

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "navbar-link active"
                : "navbar-link"
            }
          >
            Dashboard
          </NavLink>

          {/* PRODUCTS */}

          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive
                ? "navbar-link active"
                : "navbar-link"
            }
          >
            Products
          </NavLink>

          {/* CATEGORIES */}

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              isActive
                ? "navbar-link active"
                : "navbar-link"
            }
          >
            Categories
          </NavLink>

          {/* ======================================
              LOGOUT

              IMPORTANT:
              Logout is a normal button.
              It is NOT a NavLink.
              Therefore it can NEVER receive
              the "active" class.
             ====================================== */}

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogoutClick}
          >
            Logout
          </button>

        </div>
      </nav>

      {/* ==========================================
          LOGOUT CONFIRMATION MODAL
         ========================================== */}

      {showLogoutModal && (
        <div className="logout-modal-overlay">

          <div className="logout-modal">

            {/* ICON */}

            <div className="logout-icon">
              👋
            </div>

            {/* TITLE */}

            <h2>
              Leaving already?
            </h2>

            {/* MESSAGE */}

            <p>
              Are you sure you want to log out?
            </p>

            {/* BUTTONS */}

            <div className="logout-modal-actions">

              <button
                type="button"
                className="confirm-logout-btn"
                onClick={handleConfirmLogout}
              >
                Yes, Log Out
              </button>

              <button
                type="button"
                className="stay-btn"
                onClick={handleStay}
              >
                Stay
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}

export default Navbar;