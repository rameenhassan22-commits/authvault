import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
        if (active) setUser(response.data.user ?? response.data);
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
    return () => { active = false; };
  }, [navigate]);

  function handleLogout() {
    sessionStorage.removeItem("authvault_token");
    navigate("/login", { replace: true });
  }

  const handleCopyId = () => {
    if (user?._id || user?.id) {
      navigator.clipboard.writeText(user._id || user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get Initials for Avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <main className="app-wrapper loading-wrapper">
        <div className="dashboard-card loading-state">
          <span className="spinner" />
          <p>Loading your secure dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-wrapper">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* Top Navigation */}
      <nav className="app-nav">
        <Link to="/dashboard" className="brand">
          <span className="brand-mark">A</span>
          <span>AuthVault</span>
        </Link>
        <div className="nav-right">
          <div className="nav-user">
            <div className="nav-avatar">{getInitials(user?.name)}</div>
            <div className="nav-user-info">
              <span className="nav-name">{user?.name}</span>
              <span className="nav-email">{user?.email}</span>
            </div>
          </div>
          <button className="nav-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign out
          </button>
        </div>
      </nav>

      <div className="app-content">
        {/* Hero Banner */}
        <section className="dash-hero">
          <div className="hero-left">
            <span className="hero-kicker">SECURE ACCOUNT</span>
            <h1>Welcome, {user?.name || "User"}!</h1>
            <p>Your authenticated session is active.</p>
          </div>
          <div className="hero-right">
            <div className="status-pill">
              <span className="status-dot"></span>
              Session active
            </div>
          </div>
          <div className="hero-glow"></div>
        </section>

        {error && <p className="form-message" role="alert">{error}</p>}

        {/* Grid Layout */}
        {!error && (
          <div className="dash-grid">
            
            {/* Profile Card */}
            <section className="dash-card">
              <div className="dash-card-header">
                <h2>Your profile</h2>
                <p>The details saved with your account.</p>
              </div>
              
              <div className="dash-list">
                <div className="dash-row">
                  <div className="dash-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div className="dash-row-content">
                    <span className="dash-label">NAME</span>
                    <span className="dash-value">{user?.name}</span>
                  </div>
                </div>

                <div className="dash-row">
                  <div className="dash-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <div className="dash-row-content">
                    <span className="dash-label">EMAIL</span>
                    <span className="dash-value">{user?.email}</span>
                  </div>
                </div>

                <div className="dash-row">
                  <div className="dash-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <div className="dash-row-content">
                    <span className="dash-label">ACCOUNT ID</span>
                    <span className="dash-value mono">{user?._id || user?.id}</span>
                  </div>
                  <button className="copy-btn" onClick={handleCopyId} title="Copy ID">
                    {copied ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Actions Card */}
            <section className="dash-card">
              <div className="dash-card-header">
                <h2>Account actions</h2>
                <p>Manage how you sign in.</p>
              </div>

              <div className="dash-actions">
                <Link to="/change-password" className="dash-action-btn">
                  <div className="dash-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <div className="action-text">
                    <span>Change password</span>
                    <p>Choose a new password</p>
                  </div>
                  <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Link>

                <Link to="/edit-profile" className="dash-action-btn">
                  <div className="dash-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </div>
                  <div className="action-text">
                    <span>Edit profile</span>
                    <p>Update your name</p>
                  </div>
                  <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* Bottom Info */}
        <div className="session-notice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Your session lives in this browser tab only. Sign out or close the tab to end it.
        </div>
      </div>
    </main>
  );
}