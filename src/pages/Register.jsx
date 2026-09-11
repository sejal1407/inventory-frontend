import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!fullName) {
      setError("Full name is required.");
      return;
    }

    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        fullName: fullName,
        email: email,
        password: password,
      });

      console.log("Registration successful:", response.data);

      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      console.error(
        "Backend response:",
        err.response?.data
      );

      const backendData = err.response?.data;

      let backendMessage = "";

      if (typeof backendData === "string") {
        backendMessage = backendData;
      } else if (backendData?.message) {
        backendMessage = backendData.message;
      } else if (backendData?.error) {
        backendMessage = backendData.error;
      } else if (backendData?.detail) {
        backendMessage = backendData.detail;
      } else if (backendData?.fullName) {
        backendMessage = backendData.fullName;
      } else if (backendData?.email) {
        backendMessage = backendData.email;
      } else if (backendData?.password) {
        backendMessage = backendData.password;
      }

      setError(
        backendMessage ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="register-icon">
          👤
        </div>

        <h1>Create Account</h1>

        <p className="register-subtitle">
          Create your inventory management account
        </p>

        {error && (
          <div className="register-error">
            <span className="register-error-icon">
              !
            </span>

            <span>{error}</span>
          </div>
        )}

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          {/* FULL NAME */}

          <div className="register-form-group">

            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
            />

          </div>

          {/* EMAIL */}

          <div className="register-form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />

          </div>

          {/* PASSWORD */}

          <div className="register-form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="new-password"
            />

          </div>

          {/* CREATE ACCOUNT */}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <div className="register-login-text">

          <span>
            Already have an account?
          </span>

          <Link
            to="/login"
            className="register-login-link"
          >
            Sign in
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;