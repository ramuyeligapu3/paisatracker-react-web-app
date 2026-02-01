import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";
import { getProfile, updateProfile } from "../apis/profileApi";
import "./SettingsPage.css";

const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee (₹)" },
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
];

const SettingsPage = () => {
  const [profile, setProfile] = useState({ email: "", display_name: "", currency: "INR" });
  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

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
      await updateProfile({ display_name: displayName, currency });
      showToast("Profile updated");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="settings-page">Loading...</div>;

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <p className="settings-subtitle">Manage your account and preferences</p>

      <div className="settings-card">
        <h3>Profile</h3>
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
        <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
};

export default SettingsPage;
