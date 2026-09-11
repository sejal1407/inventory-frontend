import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showLoginSuccess, setShowLoginSuccess] =
        useState(false);


    // =====================================================
    // LOGIN
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Email address is required.");
            return;
        }

        if (!password) {
            setError("Password is required.");
            return;
        }

        try {

            setLoading(true);

            const response = await api.post(
                "/auth/login",
                {
                    email: email.trim(),
                    password: password
                }
            );


            // =================================================
            // SAVE JWT TOKEN
            // =================================================

            if (response.data.token) {

                localStorage.setItem(
                    "token",
                    response.data.token
                );
            }


            // =================================================
            // SAVE USER
            // =================================================

            if (response.data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        response.data.user
                    )
                );

            } else {

                const user = {
                    id: response.data.id,
                    fullName: response.data.fullName,
                    email: response.data.email,
                    role: response.data.role,
                    active: response.data.active
                };

                localStorage.setItem(
                    "user",
                    JSON.stringify(user)
                );
            }


            // =================================================
            // SHOW SUCCESS MESSAGE
            // =================================================

            setShowLoginSuccess(true);

            /*
             * Automatically go to dashboard
             * after the success message is shown.
             */
            setTimeout(() => {
                navigate("/dashboard");
            }, 1600);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Invalid email or password."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // CREATE ACCOUNT
    // =====================================================

    const handleCreateAccount = () => {
        navigate("/register");
    };


    // =====================================================
    // CONTINUE BUTTON
    // =====================================================

    const handleContinue = () => {
        navigate("/dashboard");
    };


    return (
        <div className="login-page">

            {/* =============================================
                LOGIN CARD
            ============================================== */}

            <div className="login-card">

                <h1>
                    Welcome
                </h1>

                <p>
                    Sign in to your inventory
                    management account
                </p>


                {/* =========================================
                    LOGIN FORM
                ========================================== */}

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >

                    {/* EMAIL */}

                    <div className="login-field">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(
                                    e.target.value
                                );
                                setError("");
                            }}
                            autoComplete="email"
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="login-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {
                                setPassword(
                                    e.target.value
                                );
                                setError("");
                            }}
                            autoComplete="current-password"
                        />

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    {/* SIGN IN */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing In..."
                            : "Sign In"}

                    </button>

                </form>


                {/* =========================================
                    CREATE ACCOUNT
                ========================================== */}

                <div className="login-register">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        type="button"
                        onClick={
                            handleCreateAccount
                        }
                    >
                        Create account
                    </button>

                </div>

            </div>


            {/* =============================================
                LOGIN SUCCESS MESSAGE
            ============================================== */}

            {showLoginSuccess && (

                <div className="login-success-overlay">

                    <div className="login-success-modal">

                        {/* SUCCESS ICON */}

                        <div className="login-success-icon">
                            ✨
                        </div>


                        {/* TITLE */}

                        <h2>
                            Login successful!
                        </h2>


                        {/* MESSAGE */}

                        <p>
                            Welcome back! You're all set
                            to continue.
                        </p>


                        {/* CONTINUE */}

                        <button
                            type="button"
                            className="login-success-button"
                            onClick={
                                handleContinue
                            }
                        >
                            Continue →
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Login;