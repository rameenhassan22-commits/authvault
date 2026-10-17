import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const token = sessionStorage.getItem("authvault_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await api.get("/auth/profile");

        if (active) {
          setUser(response.data.user ?? response.data);
        }
      } catch (err) {
        if (!active) return;

        if (err.response?.status === 401) {
          sessionStorage.removeItem("authvault_token");
          navigate("/login", { replace: true });
        } else {
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  function handleLogout() {
    sessionStorage.removeItem("authvault_token");
    navigate("/login", { replace: true });
  }

  if (loading) {
    return (
      <main className="auth-page">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="dashboard-card loading-state">
          <span className="spinner" />
          <p>Loading your secure dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="dashboard-card">
        {/* Header: Logo and Sign Out */}
        <header className="dashboard-header">
          <Link to="/dashboard" className="brand">
            <span className="brand-mark">A</span>
            <span>AuthVault</span>
          </Link>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </header>

        {/* Welcome Message */}
        <div className="form-heading">
          <span className="form-kicker">SECURE ACCOUNT</span>
          <h2>Welcome, {user?.name || "User"}!</h2>
          <p>Your authenticated session is active.</p>
        </div>

        {error && (
          <p className="form-message" role="alert">
            {error}
          </p>
        )}

        {!error && (
          <>
            {/* Profile Details Card */}
            <section className="profile-details">
              <h2>Your profile</h2>
              <div className="profile-grid">
                <div className="profile-item">
                  <strong>Name</strong>
                  <span>{user?.name || "Not available"}</span>
                </div>
                <div className="profile-item">
                  <strong>Email</strong>
                  <span>{user?.email || "Not available"}</span>
                </div>
                <div className="profile-item">
                  <strong>Account ID</strong>
                  <span>{user?._id || user?.id || "Not available"}</span>
                </div>
              </div>
            </section>

            {/* Account Actions Section */}
            <section className="account-actions">
              <h3>Account Actions</h3>
              <div className="action-links">
                <Link to="/change-password" className="action-link">
                  <span>Change password</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link to="/edit-profile" className="action-link">
                  <span>Edit profile</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}