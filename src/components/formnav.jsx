import React, { useEffect, useState } from 'react';
import './formnav.css';
import uetLogo from '../images/uet-lahore-logo.png';
import { Link, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useAdminContext } from '../context/AdminContext';
import DarkMode from './DarkMode/DarkMode';

const baseUrl = process.env.REACT_APP_BASE_URL;

const Formnav = () => {
  const { adminName, darkmode, setDarkmode } = useAdminContext();
  const history = useHistory();

  const handleDarkModeToggle = () => {
    setDarkmode(!darkmode); // Toggle dark mode value
  };

  return (
    <>
      <div className={`navbar ${darkmode ? 'dark-mode' : ''}`}>
        <div className="logo">
          <div className="topnavLink">
            <img src={uetLogo} alt="Loading" />
          </div>
          <div className="DarkModeToggle">
            <DarkMode darkMode={darkmode} onDarkModeToggle={handleDarkModeToggle} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Formnav;
