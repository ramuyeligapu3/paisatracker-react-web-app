// frontend/src/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    // Close sidebar if resizing larger than mobile
    if(windowWidth >= 768) setSidebarOpen(false);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowWidth]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleMenuClick = (link) => {
    navigate(link);
    if (windowWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="container">
      <Navbar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        handleMenuClick={handleMenuClick}
      />

      <main
        className="main-content"
        style={{
          marginTop: '70px',
          padding: '20px',
          marginLeft: windowWidth >= 768 && sidebarOpen ? '250px' : '0',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
