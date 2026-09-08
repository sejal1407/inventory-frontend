import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Failed to read user data:", error);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav>
      <div>
        <strong>Inventory Management System</strong>
      </div>

      <div>
        <button type="button" onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>

        <button type="button" onClick={() => navigate("/products")}>
          Products
        </button>

        <button type="button" onClick={() => navigate("/categories")}>
          Categories
        </button>

        <span>
          Welcome, {user?.fullName || "User"}
        </span>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;