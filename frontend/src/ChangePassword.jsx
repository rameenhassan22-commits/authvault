import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword.length < 8) return setError("New password must be at least 8 characters.");
    if (form.newPassword.length > 72) return setError("New password cannot exceed 72 characters.");
    if (form.newPassword !== form.confirmPassword) return setError("New passwords do not match.");
    if (form.currentPassword === form.newPassword) return setError("Your new password must differ from your current password.");

    setLoading(true);

    try {
      const response = await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setSuccess(response.data?.message || "Password changed successfully.");
      sessionStorage.removeItem("authvault_token");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { message: "Password changed successfully. Please log in again." },
        });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="settings-container">
        {/* Top Back Link */}
        <Link to="/dashboard" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to dashboard
        </Link>

        <section className="settings-card">
          <div className="brand" style={{ marginBottom: "24px" }}>
            <span className="brand-mark">A</span>
            <span>AuthVault</span>
          </div>

          <div className="form-heading">
            <p className="form-kicker">ACCOUNT SECURITY</p>
            <h1>Change password</h1>
            <p>Choose a new password to keep your account secure.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label-row" htmlFor="currentPassword">Current password</label>
              <div className="password-wrap">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.currentPassword}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="password-toggle" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="label-row" htmlFor="newPassword">New password</label>
              <div className="password-wrap">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="password-toggle" onClick={() => setShowNew(!showNew)}>
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
              <small className="field-hint">Use between 8 and 72 characters.</small>
            </div>

            <div className="field">
              <label className="label-row" htmlFor="confirmPassword">Confirm new password</label>
              <div className="password-wrap">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <p className="form-message" role="alert">{error}</p>}
            {success && <p className="form-message success" role="status">{success}</p>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? <><span className="spinner" /> Updating password...</> : "Update password"}
            </button>
            
            <Link to="/dashboard" className="cancel-button">
              Cancel
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}