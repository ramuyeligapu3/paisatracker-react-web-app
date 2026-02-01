// frontend/src/components/Loader/Loader.jsx
import React from 'react';
import './Loader.css';

/**
 * Full-screen app loader with branded spinner and optional message.
 * Use for initial auth check, route transitions, or any global loading state.
 */
const Loader = ({ message = 'Loading...', fullScreen = true }) => {
  return (
    <div className={`app-loader ${fullScreen ? 'app-loader--fullscreen' : ''}`} role="status" aria-live="polite">
      <div className="app-loader__spinner">
        <div className="app-loader__ring" />
      </div>
      {message && <p className="app-loader__message">{message}</p>}
    </div>
  );
};

export default Loader;
