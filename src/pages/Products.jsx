import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./Products.css";

const ADMIN_EMAIL = "test@gmail.com";

const PRODUCTS_PER_PAGE = 10;

const initialFormData = {
  name: "",
  sku: "",
  description: "",
  price: "",
  quantity: "",
  lowStockThreshold: "10",
  categoryId: "",
};

function Products() {
  const [searchParams] = useSearchParams();

  /* ==========================================
     FORM REF FOR SCROLLING
     ========================================== */

  const formRef = useRef(null);

  /* ==========================================
     STATE
     ========================================== */

  const [isAdmin, setIsAdmin] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] =
    useState(initialFormData);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] =
    useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const [editingProductId, setEditingProductId] =
    useState(null);

  /* ==========================================
     PAGINATION
     ========================================== */

  const [currentPage, setCurrentPage] =
    useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(
      products.length / PRODUCTS_PER_PAGE
    )
  );

  const startIndex =
    (currentPage - 1) *
    PRODUCTS_PER_PAGE;

  const currentProducts = products.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  /* Keep page valid after deletion */

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const isAddMode =
    searchParams.get("mode") === "add";

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
      } catch (error) {
        console.error(
          "Unable to read user:",
          error
        );
      }
    }
  }, []);

  /* ==========================================
     LOAD CATEGORIES
     ========================================== */

  useEffect(() => {
    loadCategories();
  }, []);

  /* ==========================================
     LOAD PRODUCTS
     ========================================== */

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
    }
  }, [isAdmin]);

  /* ==========================================
     LOAD CATEGORIES
     ========================================== */

  const loadCategories = async () => {
    try {
      const response = await api.get(
        "/categories/available"
      );

      setCategories(response.data || []);
    } catch (error) {
      console.error(
        "Error loading categories:",
        error
      );

      setCategories([]);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load categories."
      );
    }
  };

  /* ==========================================
     LOAD PRODUCTS
     ========================================== */

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await api.get(
        "/products"
      );

      setProducts(response.data || []);

      setCurrentPage(1);
    } catch (error) {
      console.error(
        "Error loading products:",
        error
      );

      setProducts([]);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load products."
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  /* ==========================================
     HANDLE INPUT
     ========================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    /* Product Name */

    if (name === "name") {
      if (!/^[A-Za-z\s]*$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          name:
            "Only letters and spaces are allowed.",
        }));

        return;
      }

      setErrors((prev) => ({
        ...prev,
        name: "",
      }));
    }

    /* Price */

    if (name === "price") {
      if (!/^\d*$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          price:
            "Only whole numbers are allowed.",
        }));

        return;
      }

      setErrors((prev) => ({
        ...prev,
        price: "",
      }));
    }

    /* Quantity */

    if (name === "quantity") {
      if (!/^\d*$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          quantity:
            "Only whole numbers are allowed.",
        }));

        return;
      }

      setErrors((prev) => ({
        ...prev,
        quantity: "",
      }));
    }

    /* Low Stock Threshold */

    if (name === "lowStockThreshold") {
      if (!/^\d*$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          lowStockThreshold:
            "Only whole numbers are allowed.",
        }));

        return;
      }

      setErrors((prev) => ({
        ...prev,
        lowStockThreshold: "",
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setErrorMessage("");
  };

  /* ==========================================
     VALIDATE FORM
     ========================================== */

  const validateForm = () => {
    const newErrors = {};

    const trimmedName =
      formData.name.trim();

    if (!trimmedName) {
      newErrors.name =
        "Product name is required.";
    } else if (
      !/^[A-Za-z\s]+$/.test(trimmedName)
    ) {
      newErrors.name =
        "Only letters and spaces are allowed.";
    }

    if (!formData.sku.trim()) {
      newErrors.sku =
        "SKU is required.";
    }

    if (formData.price === "") {
      newErrors.price =
        "Price is required.";
    } else if (
      !/^\d+$/.test(formData.price)
    ) {
      newErrors.price =
        "Only whole numbers are allowed.";
    }

    if (formData.quantity === "") {
      newErrors.quantity =
        "Quantity is required.";
    } else if (
      !/^\d+$/.test(formData.quantity)
    ) {
      newErrors.quantity =
        "Only whole numbers are allowed.";
    }

    if (
      formData.lowStockThreshold === ""
    ) {
      newErrors.lowStockThreshold =
        "Low stock threshold is required.";
    } else if (
      !/^\d+$/.test(
        formData.lowStockThreshold
      )
    ) {
      newErrors.lowStockThreshold =
        "Only whole numbers are allowed.";
    }

    if (!formData.categoryId) {
      newErrors.categoryId =
        "Please select a category.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  /* ==========================================
     ADD / UPDATE PRODUCT
     ========================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        description:
          formData.description.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        lowStockThreshold: Number(
          formData.lowStockThreshold
        ),
        categoryId: Number(
          formData.categoryId
        ),
      };

      /* ==================================
         UPDATE PRODUCT
         ================================== */

      if (editingProductId !== null) {
        const response = await api.put(
          `/products/${editingProductId}`,
          payload
        );

        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === editingProductId
              ? response.data
              : product
          )
        );

        setMessage(
          "Product updated successfully."
        );

        /* Hide success message after 5 seconds */

        setTimeout(() => {
          setMessage("");
        }, 5000);
      }

      /* ==================================
         ADD PRODUCT
         ================================== */

      else {
        const response = await api.post(
          "/products",
          payload
        );

        if (
          isAdmin &&
          response.data
        ) {
          setProducts((prevProducts) => [
            response.data,
            ...prevProducts,
          ]);

          /* New product appears on page 1 */

          setCurrentPage(1);
        }

        setMessage(
          "Product added successfully."
        );
      }

      /* Reset form */

      setFormData(initialFormData);

      setErrors({});

      setEditingProductId(null);

    } catch (error) {
      console.error(
        "Product save error:",
        error
      );

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to save product.";

      /* ==================================
         PRODUCT NOT FOUND
         ================================== */

      if (
        editingProductId !== null &&
        error.response?.status === 404
      ) {
        setErrorMessage(
          "Product not found."
        );

        setFormData(initialFormData);

        setErrors({});

        setEditingProductId(null);

        setTimeout(() => {
          setErrorMessage("");
        }, 5000);
      } else {
        setErrorMessage(
          backendMessage
        );

        setTimeout(() => {
          setErrorMessage("");
        }, 5000);
      }

    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     EDIT PRODUCT
     ========================================== */

  const handleEdit = (product) => {
    setEditingProductId(product.id);

    setFormData({
      name: product.name || "",

      sku: product.sku || "",

      description:
        product.description || "",

      price:
        product.price !== null &&
        product.price !== undefined
          ? String(
              product.price
            ).replace(
              /\.00$/,
              ""
            )
          : "",

      quantity:
        product.quantity !== null &&
        product.quantity !== undefined
          ? String(
              product.quantity
            )
          : "",

      lowStockThreshold:
        product.lowStockThreshold !== null &&
        product.lowStockThreshold !==
          undefined
          ? String(
              product.lowStockThreshold
            )
          : "10",

      categoryId:
        product.category?.id !== null &&
        product.category?.id !==
          undefined
          ? String(
              product.category.id
            )
          : "",
    });

    setErrors({});

    setMessage("");

    setErrorMessage("");

    /* Scroll to edit form */

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  /* ==========================================
     DELETE PRODUCT
     ========================================== */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      await api.delete(
        `/products/${id}`
      );

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) =>
            product.id !== id
        )
      );

      setMessage(
        "Product deleted successfully."
      );

    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to delete product."
      );

      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };

  /* ==========================================
     CANCEL EDIT
     ========================================== */

  const handleCancel = () => {
    setFormData(initialFormData);

    setErrors({});

    setEditingProductId(null);

    setMessage("");

    setErrorMessage("");
  };

  /* ==========================================
     FIELD ERROR
     ========================================== */

  const renderFieldError = (
    fieldName
  ) => {
    if (!errors[fieldName]) {
      return null;
    }

    return (
      <div className="field-error">
        <span className="error-icon">
          !
        </span>

        <span>
          {errors[fieldName]}
        </span>
      </div>
    );
  };

  /* ==========================================
     RENDER
     ========================================== */

  return (
    <>
      <Navbar />

      <div className="products-page">
        <div className="products-container">

          {/* PAGE HEADING */}

          <h1>Products</h1>

          <p className="products-subtitle">
            {isAdmin
              ? "Manage all inventory products"
              : "Add a new inventory product"}
          </p>

          {/* SUCCESS MESSAGE */}

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {/* ERROR MESSAGE */}

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          {/* ==================================
              ADD / EDIT PRODUCT
              ================================== */}

          <div
            className="product-card"
            ref={formRef}
          >

            <h2>
              {editingProductId !== null
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >

              {/* PRODUCT NAME */}

              <div className="form-group">

                <label htmlFor="name">
                  Product Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={
                    errors.name
                      ? "invalid"
                      : ""
                  }
                />

                {renderFieldError(
                  "name"
                )}

              </div>

              {/* SKU */}

              <div className="form-group">

                <label htmlFor="sku">
                  SKU
                </label>

                <input
                  id="sku"
                  name="sku"
                  type="text"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Enter SKU"
                  className={
                    errors.sku
                      ? "invalid"
                      : ""
                  }
                />

                {renderFieldError(
                  "sku"
                )}

              </div>

              {/* DESCRIPTION */}

              <div className="form-group full-width">

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Enter description"
                />

              </div>

              {/* PRICE */}

              <div className="form-group">

                <label htmlFor="price">
                  Price
                </label>

                <input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="numeric"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  className={
                    errors.price
                      ? "invalid"
                      : ""
                  }
                />

                {renderFieldError(
                  "price"
                )}

              </div>

              {/* QUANTITY */}

              <div className="form-group">

                <label htmlFor="quantity">
                  Quantity
                </label>

                <input
                  id="quantity"
                  name="quantity"
                  type="text"
                  inputMode="numeric"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  className={
                    errors.quantity
                      ? "invalid"
                      : ""
                  }
                />

                {renderFieldError(
                  "quantity"
                )}

              </div>

              {/* LOW STOCK */}

              <div className="form-group">

                <label htmlFor="lowStockThreshold">
                  Low Stock Threshold
                </label>

                <input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="text"
                  inputMode="numeric"
                  value={
                    formData.lowStockThreshold
                  }
                  onChange={handleChange}
                  placeholder="Enter low stock threshold"
                  className={
                    errors.lowStockThreshold
                      ? "invalid"
                      : ""
                  }
                />

                {renderFieldError(
                  "lowStockThreshold"
                )}

              </div>

              {/* CATEGORY */}

              <div className="form-group">

                <label htmlFor="categoryId">
                  Category
                </label>

                <select
                  id="categoryId"
                  name="categoryId"
                  value={
                    formData.categoryId
                  }
                  onChange={handleChange}
                  className={
                    errors.categoryId
                      ? "invalid"
                      : ""
                  }
                >

                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>

                {renderFieldError(
                  "categoryId"
                )}

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? editingProductId !== null
                    ? "Updating..."
                    : "Adding..."
                  : editingProductId !== null
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {/* CANCEL */}

              {editingProductId !== null && (
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
              ALL PRODUCTS
              ================================== */}

          {isAdmin && !isAddMode && (
            <div className="product-card">

              <h2>
                All Products
              </h2>

              {loadingProducts ? (
                <div className="loading-message">
                  Loading products...
                </div>

              ) : products.length === 0 ? (
                <div className="empty-products">
                  No products found.
                </div>

              ) : (
                <>

                  <div className="product-count">
                    {products.length}{" "}
                    {products.length === 1
                      ? "product"
                      : "products"}
                  </div>

                  <div className="products-table-wrapper">

                    <table className="products-table">

                      <thead>
                        <tr>

                          {/* SERIAL NUMBER */}

                          <th>
                            Sr. No.
                          </th>

                          <th>
                            Name
                          </th>

                          <th>
                            SKU
                          </th>

                          <th>
                            Description
                          </th>

                          <th>
                            Price
                          </th>

                          <th>
                            Quantity
                          </th>

                          <th>
                            Low Stock
                          </th>

                          <th>
                            Category
                          </th>

                          <th>
                            Created By
                          </th>

                          <th>
                            Actions
                          </th>

                        </tr>
                      </thead>

                      <tbody>

                        {currentProducts.map(
                          (
                            product,
                            index
                          ) => {

                            const isLowStock =
                              product.quantity <=
                              product.lowStockThreshold;

                            /*
                              Continuous serial number
                              across all pages.
                            */

                            const serialNumber =
                              startIndex +
                              index +
                              1;

                            return (
                              <tr
                                key={
                                  product.id
                                }
                              >

                                {/* SR NO */}

                                <td>
                                  {
                                    serialNumber
                                  }
                                </td>

                                {/* NAME */}

                                <td className="product-name-cell">
                                  {
                                    product.name
                                  }
                                </td>

                                {/* SKU */}

                                <td className="product-sku">
                                  {
                                    product.sku
                                  }
                                </td>

                                {/* DESCRIPTION */}

                                <td>
                                  {
                                    product.description ||
                                    "-"
                                  }
                                </td>

                                {/* PRICE */}

                                <td>
                                  ₹
                                  {Number(
                                    product.price ||
                                      0
                                  ).toFixed(0)}
                                </td>

                                {/* QUANTITY */}

                                <td>

                                  <span
                                    className={`quantity-badge ${
                                      isLowStock
                                        ? "low-stock"
                                        : ""
                                    }`}
                                  >
                                    {
                                      product.quantity
                                    }
                                  </span>

                                </td>

                                {/* LOW STOCK */}

                                <td>
                                  {
                                    product.lowStockThreshold
                                  }
                                </td>

                                {/* CATEGORY */}

                                <td>
                                  {product
                                    .category
                                    ?.name ||
                                    "-"}
                                </td>

                                {/* CREATED BY */}

                                <td>
                                  {
                                    product.createdBy ||
                                    "-"
                                  }
                                </td>

                                {/* ACTIONS */}

                                <td>

                                  <div className="action-buttons">

                                    <button
                                      type="button"
                                      className="edit-btn"
                                      onClick={() =>
                                        handleEdit(
                                          product
                                        )
                                      }
                                      title="Edit Product"
                                      aria-label="Edit Product"
                                    >
                                      ✏️
                                    </button>

                                    <button
                                      type="button"
                                      className="delete-btn"
                                      onClick={() =>
                                        handleDelete(
                                          product.id
                                        )
                                      }
                                      title="Delete Product"
                                      aria-label="Delete Product"
                                    >
                                      🗑️
                                    </button>

                                  </div>

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* ==================================
                      PAGINATION
                      ================================== */}

                  {totalPages > 1 && (
                    <div className="pagination">

                      <button
                        type="button"
                        className="pagination-btn"
                        disabled={
                          currentPage === 1
                        }
                        onClick={() =>
                          setCurrentPage(
                            (prev) =>
                              Math.max(
                                1,
                                prev - 1
                              )
                          )
                        }
                      >
                        Previous
                      </button>

                      <span className="pagination-info">
                        Page{" "}
                        {currentPage}{" "}
                        of{" "}
                        {totalPages}
                      </span>

                      <button
                        type="button"
                        className="pagination-btn"
                        disabled={
                          currentPage ===
                          totalPages
                        }
                        onClick={() =>
                          setCurrentPage(
                            (prev) =>
                              Math.min(
                                totalPages,
                                prev + 1
                              )
                          )
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

export default Products;