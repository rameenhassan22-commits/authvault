import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

export default function EditProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await api.get("/auth/profile");
        if (active) {
          setName(response.data.user.name);
          setEmail(response.data.user.email);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Unable to load your profile.");
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    }

    loadProfile();
    return () => { active = false; };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }
    if (trimmedName.length > 80) {
      setError("Name cannot exceed 80 characters.");
      return;
    }
    if (!/[a-zA-Z]/.test(trimmedName)) {
      setError("Name must contain at least one letter (A-Z).");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put("/auth/profile", { name: trimmedName });
      setName(response.data.user.name);
      setSuccess("Your profile was updated successfully.");
      setTimeout(() => navigate("/dashboard", { replace: true }), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  const getInitials = (str) => {
    if (!str) return "U";
    const parts = str.trim().split(" ");
    return parts.length > 1 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : str.substring(0, 2).toUpperCase();
  };

  if (loadingProfile) {
    return (
      <main className="auth-page">
        <div className="spinner" />
      </main>
    );
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
            <p className="form-kicker">ACCOUNT SETTINGS</p>
            <h1>Edit profile</h1>
            <p>Update the name associated with your account.</p>
          </div>

          {/* User Avatar Preview */}
          <div className="settings-user-preview">
            <div className="nav-avatar" style={{ width: "48px", height: "48px", fontSize: "18px" }}>
              {getInitials(name)}
            </div>
            <div className="settings-user-info">
              <span className="settings-user-name">{name}</span>
              <span className="settings-user-email">{email}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label-row" htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                minLength={3}
                maxLength={80}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); setSuccess(""); }}
                required
              />
            </div>

            {error && <p className="form-message" role="alert">{error}</p>}
            {success && <p className="form-message success" role="status">{success}</p>}

            <button type="submit" className="submit-button" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving changes...</> : "Save changes"}
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