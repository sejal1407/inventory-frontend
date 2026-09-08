import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("LOAD CATEGORIES ERROR:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to load categories.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Clear form
  const clearForm = () => {
    setName("");
    setEditingId(null);
  };

  // Add or update category
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (editingId === null) {
        await api.post("/categories", {
          name: name,
        });

        setSuccess("Category added successfully.");
      } else {
        await api.put(`/categories/${editingId}`, {
          name: name,
        });

        setSuccess("Category updated successfully.");
      }

      clearForm();
      await loadCategories();
    } catch (err) {
      console.error("CATEGORY SAVE ERROR:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Operation failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);

    setError("");
    setSuccess("");
  };

  // Delete category
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

      await api.delete(`/categories/${id}`);

      setSuccess("Category deleted successfully.");

      await loadCategories();
    } catch (err) {
      console.error("DELETE CATEGORY ERROR:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to delete category.");
      }
    }
  };

  // Loading
  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <div><Navbar />
      <h1>Categories</h1>

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>

      <br />
      <br />

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      {/* Add / Edit Category */}
      <h2>
        {editingId === null ? "Add Category" : "Edit Category"}
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : editingId === null
            ? "Add Category"
            : "Update Category"}
        </button>

        {editingId !== null && (
          <button type="button" onClick={clearForm}>
            Cancel
          </button>
        )}
      </form>

      <br />

      {/* Category List */}
      <h2>Category List</h2>

      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>
                  {category.active ? "Active" : "Inactive"}
                </td>

                <td>
                  <button onClick={() => handleEdit(category)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(category.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Categories;