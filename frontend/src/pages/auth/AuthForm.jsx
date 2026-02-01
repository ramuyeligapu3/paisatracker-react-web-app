// frontend/src/pages/auth/AuthForm.jsx
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import React, { useState } from 'react';
import './AuthForm.css';
import Toast from '../../components/Toast';
import { login, signup, forgotPassword } from '../../apis/authApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // adjust path if needed


const AuthForm = ({ view, onSwitchView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // rename to avoid clash with api login 
  // Inside component:
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);


  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
   

  };

  function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let res;

    if (view === 'login') {
      res = await login(email, password);
      
      console.log(res)
      if (res.success) {

        const csrfToken = getCookie('refreshToken');
        console.log("refreshToken:", csrfToken);

       
        showToast(res.message, 'success');
        setTimeout(() => {
          authLogin(res.data.userId,res.data.accessToken);
          navigate('/');
        }, 3000); // wait for toast to be visible
      }


    } else if (view === 'signup') {
      res = await signup(email, password);
      showToast(res.message, 'success');

      if (res.success) {
        // ✅ Switch back to login view
        onSwitchView('login');
      }

    } else if (view === 'forgot') {
      res = await forgotPassword(email);
      showToast(res.message || 'If an account exists, check your email for a Paisatracker reset link.', 'success');
    }

  } catch (err) {
    const message = err.response?.data?.message || 'Something went wrong';
    showToast(message, 'error');
  }
};


  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">
        {view === 'login' && 'Sign in to your account'}
        {view === 'signup' && 'Create an account'}
        {view === 'forgot' && 'Reset Password'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="auth-form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {view !== 'forgot' && (
          <div className="auth-form-group password-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="toggle-icon" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEye />:<FaEyeSlash />}
              </span>
            </div>
          </div>

        )}

        <button type="submit" className="auth-form-button">
          {view === 'login' && 'Sign In'}
          {view === 'signup' && 'Sign Up'}
          {view === 'forgot' && 'Send reset link'}
        </button>
      </form>

      <div className="auth-form-footer">
        {view === 'login' && (
          <>
            <p>
              Don't have an account?{' '}
              <button onClick={() => onSwitchView('signup')}>Sign up for free</button>
            </p>
            <p>
              <button onClick={() => onSwitchView('forgot')}>Forgot password?</button>
            </p>
          </>
        )}
        {view === 'signup' && (
          <p>
            Already have an account?{' '}
            <button onClick={() => onSwitchView('login')}>Sign in</button>
          </p>
        )}
        {view === 'forgot' && (
          <p>
            <button onClick={() => onSwitchView('login')}>Back to Sign In</button>
          </p>
        )}
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
};

export default AuthForm;
