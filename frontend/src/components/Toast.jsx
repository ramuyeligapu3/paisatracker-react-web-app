// frontend/src/components/Toast.jsx
import React from 'react';
import './Toast.css';

function Toast({ message, show, type = 'success' }) {
  if (!show) return null;

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
}

export default Toast;
