import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";
import { getProfile, updateProfile, changePassword } from "../apis/profileApi";
import "./SettingsPage.css";

const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee (₹)" },
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
];

const SettingsPage = () => {
  const [profile, setProfile] = useState({ email: "", display_name: "", currency: "INR", email_digest: true });
  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [emailDigest, setEmailDigest] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (res.success && res.data) {
          setProfile(res.data);
          setDisplayName(res.data.display_name || "");
          setCurrency(res.data.currency || "INR");
          setEmailDigest(res.data.email_digest !== false);
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({ display_name: displayName, currency, email_digest: emailDigest });
      showToast("Profile updated");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    try {
      setChangingPassword(true);
      await changePassword(currentPassword, newPassword);
      showToast("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-page-header">
          <h2><span className="settings-icon" aria-hidden>⚙️</span> Settings</h2>
          <p className="settings-subtitle">Manage your account and preferences</p>
        </div>
        <div className="settings-loading">
          <div className="settings-loading-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <h2><span className="settings-icon" aria-hidden>⚙️</span> Settings</h2>
        <p className="settings-subtitle">Manage your account and preferences</p>
      </header>

      <div className="settings-grid">
        <div className="settings-card">
          <h3><span className="card-icon" aria-hidden>👤</span> Profile</h3>
          <div className="settings-field">
            <label>Email</label>
            <input type="text" value={profile.email || ""} readOnly disabled />
          </div>
          <div className="settings-field">
            <label>Display name</label>
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="settings-field">
            <label>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="settings-toggle-row">
            <div>
              <div className="settings-toggle-label">Monthly email summary</div>
              <div className="settings-toggle-desc">Receive a monthly spending summary by email</div>
            </div>
            <button
              type="button"
              className={`settings-toggle ${emailDigest ? "on" : ""}`}
              onClick={() => setEmailDigest((v) => !v)}
              role="switch"
              aria-checked={emailDigest}
              aria-label="Toggle monthly email summary"
            >
              <span className="settings-toggle-knob" />
            </button>
          </div>
          <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        <div className="settings-card settings-card-password">
          <h3><span className="card-icon" aria-hidden>🔒</span> Change password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="settings-field">
            <label>Current password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="settings-field">
            <label>New password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
            />
          </div>
          <div className="settings-field">
            <label>Confirm new password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="settings-save-btn"
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {changingPassword ? "Updating…" : "Change password"}
          </button>
        </form>
        </div>
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
};

export default SettingsPage;
