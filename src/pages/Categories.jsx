import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Categories.css";

const ADMIN_EMAIL = "test@gmail.com";

function Categories() {
  const [isAdmin, setIsAdmin] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingCategoryId, setEditingCategoryId] =
    useState(null);

  const [loading, setLoading] = useState(false);

  /* ==========================================
     PAGINATION
     ========================================== */

  const categoriesPerPage = 10;

  const [currentPage, setCurrentPage] =
    useState(1);

  const totalPages = Math.ceil(
    categories.length / categoriesPerPage
  );

  const startIndex =
    (currentPage - 1) * categoriesPerPage;

  const currentCategories =
    categories.slice(
      startIndex,
      startIndex + categoriesPerPage
    );

  /* ==========================================
     LOAD USER
     ========================================== */

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser =
          JSON.parse(storedUser);

        setIsAdmin(
          parsedUser?.email === ADMIN_EMAIL
        );
      } catch (err) {
        console.error(
          "Unable to read user:",
          err
        );
      }
    }
  }, []);

  /* ==========================================
     LOAD CATEGORIES
     ========================================== */

  useEffect(() => {
    if (isAdmin) {
      loadCategories();
    } else {
      setCategories([]);
    }
  }, [isAdmin]);

  /* ==========================================
     KEEP CURRENT PAGE VALID
     ========================================== */

  useEffect(() => {
    const newTotalPages = Math.ceil(
      categories.length / categoriesPerPage
    );

    if (
      newTotalPages > 0 &&
      currentPage > newTotalPages
    ) {
      setCurrentPage(newTotalPages);
    }

    if (
      categories.length === 0 &&
      currentPage !== 1
    ) {
      setCurrentPage(1);
    }
  }, [categories.length, currentPage]);

  const loadCategories = async () => {
    try {
      const response = await api.get(
        "/categories"
      );

      setCategories(response.data || []);
    } catch (err) {
      console.error(
        "Error loading categories:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load categories."
      );
    }
  };

  /* ==========================================
     CATEGORY INPUT
     ========================================== */

  const handleCategoryChange = (event) => {
    const value = event.target.value;

    if (!/^[A-Za-z\s]*$/.test(value)) {
      setError(
        "Only letters and spaces are allowed."
      );

      setSuccess("");

      return;
    }

    setCategoryName(value);

    setError("");
    setSuccess("");
  };

  /* ==========================================
     SUBMIT CATEGORY
     ========================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName =
      categoryName.trim();

    if (!trimmedName) {
      setError(
        "Category name is required."
      );

      return;
    }

    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      setError(
        "Only letters and spaces are allowed."
      );

      return;
    }

    try {
      setLoading(true);

      /* UPDATE */

      if (editingCategoryId) {
        const response = await api.put(
          `/categories/${editingCategoryId}`,
          {
            name: trimmedName,
          }
        );

        setCategories((prev) =>
          prev.map((category) =>
            category.id === editingCategoryId
              ? response.data
              : category
          )
        );

        setSuccess(
          "Category updated successfully."
        );

        setEditingCategoryId(null);
      }

      /* CREATE */

      else {
        const response = await api.post(
          "/categories",
          {
            name: trimmedName,
          }
        );

        setSuccess(
          "Category added successfully."
        );

        if (isAdmin && response.data) {
          setCategories((prev) => [
            response.data,
            ...prev,
          ]);

          /* New category appears on page 1 */
          setCurrentPage(1);
        }
      }

      setCategoryName("");
    } catch (err) {
      console.error(
        "Category save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to save category."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     EDIT CATEGORY
     ========================================== */

  const handleEdit = (category) => {
    setEditingCategoryId(
      category.id
    );

    setCategoryName(
      category.name || ""
    );

    setError("");
    setSuccess("");
  };

  /* ==========================================
     DELETE CATEGORY
     ========================================== */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/categories/${id}`
      );

      setCategories((prev) =>
        prev.filter(
          (category) =>
            category.id !== id
        )
      );

      setSuccess(
        "Category deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete category error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to delete category."
      );
    }
  };

  /* ==========================================
     CANCEL EDIT
     ========================================== */

  const handleCancel = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setError("");
    setSuccess("");
  };

  /* ==========================================
     RENDER
     ========================================== */

  return (
    <>
      <Navbar />

      <div className="categories-page">
        <div className="categories-container">

          {/* PAGE HEADING */}

          <h1>Categories</h1>

          <p className="categories-subtitle">
            {isAdmin
              ? "Manage all inventory categories"
              : "Add a new inventory category"}
          </p>

          {/* SUCCESS */}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {/* GENERAL ERROR */}

          {error &&
            error !==
              "Only letters and spaces are allowed." && (
              <div className="error-message">

                <span className="error-icon">
                  !
                </span>

                <span>{error}</span>

              </div>
            )}

          {/* ==================================
              CATEGORY FORM
             ================================== */}

          <div className="category-card">

            <h2>
              {editingCategoryId
                ? "Edit Category"
                : "Add Category"}
            </h2>

            <form
              className="category-form"
              onSubmit={handleSubmit}
            >

              <div className="category-form-group">

                <label htmlFor="categoryName">
                  Category Name
                </label>

                <input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={
                    handleCategoryChange
                  }
                  placeholder="Enter category name"
                  className={
                    error ===
                    "Only letters and spaces are allowed."
                      ? "invalid"
                      : ""
                  }
                />

                {error ===
                  "Only letters and spaces are allowed." && (
                  <div className="field-error">

                    <span className="error-icon">
                      !
                    </span>

                    <span>
                      Only letters and spaces are allowed.
                    </span>

                  </div>
                )}

              </div>

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? editingCategoryId
                    ? "Updating..."
                    : "Adding..."
                  : editingCategoryId
                  ? "Update Category"
                  : "Add Category"}
              </button>

              {editingCategoryId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}

            </form>

          </div>

          {/* ==================================
              ALL CATEGORIES
             ================================== */}

          {isAdmin && (
            <div className="category-card">

              <h2>All Categories</h2>

              {categories.length === 0 ? (
                <div className="empty-categories">
                  No categories found.
                </div>
              ) : (
                <>

                  <div className="category-count">
                    {categories.length}{" "}
                    {categories.length === 1
                      ? "category"
                      : "categories"}
                  </div>

                  <div className="categories-table-wrapper">

                    <table className="categories-table">

                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Category Name</th>
                          <th>Created By</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>

                        {currentCategories.map(
                          (
                            category,
                            index
                          ) => (
                            <tr
                              key={
                                category.id
                              }
                            >

                              {/* SR. NO. */}

                              <td>
                                {startIndex +
                                  index +
                                  1}
                              </td>

                              {/* CATEGORY NAME */}

                              <td className="category-name-cell">
                                {
                                  category.name
                                }
                              </td>

                              {/* CREATED BY */}

                              <td>
                                <span className="created-by-badge">
                                  {category.createdBy ||
                                    "-"}
                                </span>
                              </td>

                              {/* ACTIONS */}

                              <td>

                                <div className="category-actions">

                                  <button
                                    type="button"
                                    className="edit-category-btn"
                                    onClick={() =>
                                      handleEdit(
                                        category
                                      )
                                    }
                                    title="Edit Category"
                                    aria-label="Edit Category"
                                  >
                                    ✏️
                                  </button>

                                  <button
                                    type="button"
                                    className="delete-category-btn"
                                    onClick={() =>
                                      handleDelete(
                                        category.id
                                      )
                                    }
                                    title="Delete Category"
                                    aria-label="Delete Category"
                                  >
                                    🗑️
                                  </button>

                                </div>

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* ==================================
                      PAGINATION
                     ================================== */}

                  {totalPages > 1 && (
                    <div className="category-pagination">

                      <button
                        type="button"
                        className="category-pagination-btn"
                        onClick={() =>
                          setCurrentPage(
                            (prev) =>
                              Math.max(
                                prev - 1,
                                1
                              )
                          )
                        }
                        disabled={
                          currentPage === 1
                        }
                      >
                        Previous
                      </button>

                      <span className="category-pagination-info">
                        Page {currentPage} of{" "}
                        {totalPages}
                      </span>

                      <button
                        type="button"
                        className="category-pagination-btn"
                        onClick={() =>
                          setCurrentPage(
                            (prev) =>
                              Math.min(
                                prev + 1,
                                totalPages
                              )
                          )
                        }
                        disabled={
                          currentPage ===
                          totalPages
                        }
                      >
                        Next
                      </button>

                    </div>
                  )}

                </>
              )}

            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default Categories;