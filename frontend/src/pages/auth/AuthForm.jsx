import React from 'react';
import './AuthForm.css'; // ✅ Import CSS

const AuthForm = ({ view, onSwitchView }) => {
  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">
        {view === 'login' && 'Sign in to your account'}
        {view === 'signup' && 'Create an account'}
        {view === 'forgot' && 'Reset Password'}
      </h2>

      <form>
        <div className="auth-form-group">
          <label>Email Address</label>
          <input type="email" placeholder="Enter your email" />
        </div>

        {view !== 'forgot' && (
          <div className="auth-form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
          </div>
        )}

        <button type="submit" className="auth-form-button">
          {view === 'login' && 'Sign In'}
          {view === 'signup' && 'Sign Up'}
          {view === 'forgot' && 'Reset Password'}
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
    </div>
  );
};

export default AuthForm;
