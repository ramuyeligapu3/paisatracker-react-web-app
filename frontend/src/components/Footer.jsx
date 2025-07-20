import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} Paisa Tracker. All rights reserved.
    </footer>
  );
};

export default Footer;
