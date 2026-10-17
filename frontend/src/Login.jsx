import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => ({ ...previous, [name]: "" }));
        setServerError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const email = form.email.trim();
        const nextErrors = {};

        if (!email) {
            nextErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = "Enter a valid email address";
        }

        if (!form.password) {
            nextErrors.password = "Password is required";
        } else if (form.password.length > 72) {
            nextErrors.password = "Password cannot exceed 72 characters";
        }

        setErrors(nextErrors);
        setServerError("");

        if (Object.keys(nextErrors).length > 0) return;

        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password: form.password,
            });

            const token = response.data?.token;

            if (!token) {
                setServerError(
                    "Login succeeded, but no token was returned. Check the backend login response."
                );
                return;
            }

            sessionStorage.setItem("authvault_token", token);
            setServerError("");
            navigate("/dashboard");
        } catch (error) {
            if (error.response) {
                setServerError(
                    error.response.data?.message || "Login failed. Please try again."
                );
            } else {
                setServerError(
                    "Cannot connect to the server. Make sure the backend is running on port 5000."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            {/* Added ambient backgrounds to match Register */}
            <div className="ambient ambient-one" />
            <div className="ambient ambient-two" />

            <section className="auth-layout">
                <aside className="auth-intro">
                    <div className="brand">
                        <div className="brand-mark">A</div>
                        <span>AuthVault</span>
                    </div>

                    <div className="intro-content">
                        <span className="eyebrow">
                            <span className="status-dot" />
                            YOUR SECURITY, YOUR CONTROL
                        </span>

                        <h1>
                            Welcome
                            <br />
                            <span>back.</span>
                        </h1>

                        <p className="intro-description">
                            Sign in to securely access your account and manage your identity.
                        </p>
                    </div>

                    <p className="intro-footer">
                        AUTHVAULT <span>•</span> SECURE BY DESIGN
                    </p>
                </aside>

                <div className="form-side">
                    <form className="register-card" onSubmit={handleSubmit} noValidate>
                        <div className="mobile-brand brand">
                            <div className="brand-mark">A</div>
                            <span>AuthVault</span>
                        </div>

                        <div className="form-heading">
                            <span className="form-kicker">WELCOME BACK</span>
                            <h2>Sign in</h2>
                            <p>Enter your credentials to continue.</p>
                        </div>

                        <div className="field">
                            <label htmlFor="login-email">Email address</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? "login-email-error" : undefined}
                            />
                            {errors.email && (
                                <p id="login-email-error" className="field-error">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="field">
                            <div className="label-row">
                                <label htmlFor="login-password">Password</label>
                            </div>

                            <div className="password-wrap">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={
                                        errors.password ? "login-password-error" : undefined
                                    }
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword((previous) => !previous)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.password && (
                                <p id="login-password-error" className="field-error">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {serverError && (
                            <p className="form-message" role="alert">
                                {serverError}
                            </p>
                        )}

                        <button className="submit-button" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in securely <span aria-hidden="true">→</span>
                                </>
                            )}
                        </button>

                        <div className="form-divider">
                            <span>SECURE LOGIN</span>
                        </div>

                        <p className="auth-footer">
                            Don&apos;t have an account? <Link to="/register">Create one</Link>
                        </p>

                        <p className="privacy-note">
                            <span aria-hidden="true">♢</span> Your password is hashed before
                            being stored.
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}