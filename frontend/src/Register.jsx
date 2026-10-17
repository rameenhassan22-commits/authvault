
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import GoogleSignInButton from "./GoogleSignInButton";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrors({});
        setMessage("");

        const nextErrors = {};
        const name = form.name.trim();
        const email = form.email.trim();

        if (!name) {
            nextErrors.name = "Name is required";
        } else if (name.length < 3) {
            nextErrors.name = "Name must be at least 3 characters";
        } else if (!/[a-zA-Z]/.test(name)) {
            nextErrors.name = "Name must contain at least one letter (A-Z)";
        }

        if (!email) {
            nextErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = "Enter a valid email address";
        }

        if (form.password.length < 8) {
            nextErrors.password = "Password must be at least 8 characters";
        } else if (form.password.length > 72) {
            nextErrors.password = "Password cannot exceed 72 characters";
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/register", {
                name,
                email,
                password: form.password,
            });

            navigate("/login", {
                state: { message: "Account created successfully. Please log in." },
            });
        } catch (error) {
            const data = error.response?.data;

            if (data?.errors) {
                const backendErrors = {};
                data.errors.forEach(({ field, message }) => {
                    backendErrors[field] = message;
                });
                setErrors(backendErrors);
            } else if (data?.field) {
                setErrors({ [data.field]: data.message });
            } else {
                setMessage(
                    data?.message ||
                    "Couldn't create your account. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
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
                            YOUR IDENTITY, PROTECTED
                        </span>

                        <h1>
                            Security starts
                            <br />
                            <span>with you.</span>
                        </h1>

                        <p className="intro-description">
                            One secure place for your digital identity.
                            Create your account and take control of your access.
                        </p>

                        <div className="security-points">
                            <div className="security-item">
                                <span className="security-icon">✳</span>
                                <div>
                                    <strong>Built with security in mind</strong>
                                    <p>Protected authentication and encrypted passwords.</p>
                                </div>
                            </div>

                            <div className="security-item">
                                <span className="security-icon">↗</span>
                                <div>
                                    <strong>Your account, your control</strong>
                                    <p>Manage your identity from one simple place.</p>
                                </div>
                            </div>
                        </div>
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
                            <span className="form-kicker">GET STARTED</span>
                            <h2>Create your account</h2>
                            <p>Enter your details to join AuthVault.</p>
                        </div>

                        <div className="field">
                            <label htmlFor="name">Full name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="e.g. Alex Morgan"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                minLength={3}
                                maxLength={80}
                                aria-invalid={Boolean(errors.name)}
                                aria-describedby={errors.name ? "name-error" : undefined}
                            />
                            {errors.name && (
                                <p id="name-error" className="field-error">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                maxLength={254}
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? "email-error" : undefined}
                            />
                            {errors.email && (
                                <p id="email-error" className="field-error">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="field">
                            <div className="label-row">
                                <label htmlFor="password">Password</label>
                                <span className="label-hint">8+ characters</span>
                            </div>

                            <div className="password-wrap">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    minLength={8}
                                    maxLength={72}
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={
                                        errors.password ? "password-error" : "password-hint"
                                    }
                                />
                                <button
                                    className="password-toggle"
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            {errors.password ? (
                                <p id="password-error" className="field-error">
                                    {errors.password}
                                </p>
                            ) : (
                                <p id="password-hint" className="field-hint">
                                    Use at least 8 characters.
                                </p>
                            )}
                        </div>

                        {message && (
                            <p className="form-message" role="alert">
                                {message}
                            </p>
                        )}

                        <button className="submit-button" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account <span aria-hidden="true">→</span>
                                </>
                            )}
                        </button>
                        <GoogleSignInButton />

                        <div className="form-divider">
                            <span>SECURE REGISTRATION</span>
                        </div>

                        <p className="auth-footer">
                            Already have an account? <Link to="/login">Sign in</Link>
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
