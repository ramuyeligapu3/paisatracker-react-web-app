// frontend/src/pages/auth/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { resetPassword } from '../../apis/authApi';
import Toast from '../../components/Toast';
import './AuthForm.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setToast({ show: true, message: 'Invalid reset link. Please request a new one.', type: 'error' });
    }
  }, [token]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    try {
      const res = await resetPassword(token, password);
      showToast(res.message || 'Password reset. Sign in with your new password.', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong';
      showToast(message, 'error');
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <main className="auth-page-main">
          <div className="auth-form-container">
            <h2 className="auth-form-title">Invalid reset link</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Use the link from your Paisatracker email or request a new one from the login page.
            </p>
            <button type="button" className="auth-form-button" onClick={() => navigate('/login')}>
              Back to Sign In
            </button>
            <Toast show={toast.show} message={toast.message} type={toast.type} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <main className="auth-page-main">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Set new password</h2>
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group password-group">
              <label>New password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <span className="toggle-icon" onClick={() => setShowPassword((p) => !p)} aria-label="Toggle password visibility">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <div className="auth-form-group">
              <label>Confirm password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="auth-form-button">
              Reset password
            </button>
          </form>
          <div className="auth-form-footer" style={{ marginTop: 16 }}>
            <button type="button" onClick={() => navigate('/login')}>Back to Sign In</button>
          </div>
          <Toast show={toast.show} message={toast.message} type={toast.type} />
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
