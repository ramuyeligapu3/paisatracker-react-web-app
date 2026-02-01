// frontend/src/components/Navbar.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ sidebarOpen, toggleSidebar, handleMenuClick }) => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { label: 'Dashboard', link: '/', icon: '🏠' },
    { label: 'Transactions', link: '/transactions', icon: '💰' },
    { label: 'Settings', link: '/settings', icon: '⚙️' },
    { label: 'Logout', link: '/logout', icon: '🚪' },
  ];

  return (
    <div className="navbar">
      <div className="hamburger" onClick={toggleSidebar}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      <div className="navbar-title">PaisaTracker</div>

      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Light mode' : 'Dark mode'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="nav-large">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.link}
            className={`nav-link ${location.pathname === item.link ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleMenuClick(item.link);
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>

      {/* Sidebar for mobile */}
      {sidebarOpen && <div className="overlay" onClick={toggleSidebar} />}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.link}
                className={location.pathname === item.link ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick(item.link);
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
