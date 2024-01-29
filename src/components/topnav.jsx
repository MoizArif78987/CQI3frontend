import React, { useEffect, useState } from 'react';
import './topnav.css';
import uetLogo from '../images/uet-lahore-logo.png';
import logout from '../images/logout.png';
import pfp from '../images/pfp.png';
import { Link,useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useAdminContext } from '../context/AdminContext';
const baseUrl =process.env.REACT_APP_BASE_URL;


const Topnav = () => {
  const { adminName } = useAdminContext();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
      }); 
      if (response.ok) {
        // Redirect to the '/' page
        history.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      <div className="navbar">
        <div className="logo">
          <Link to="/adminpanel" className="topnavLink">
            <img src={uetLogo} alt="Loading" />
          </Link>
        </div>
        <div className="NavProfilesction">
          <Link to="/profile" className="profileLink">
            <div className="profile">
              <img src={pfp} alt="Loading" />
              <h5>{adminName}</h5>
            </div>
          </Link>
          <div className="logout"  onClick={handleLogout}>
              <img src={logout} alt="Loading" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Topnav;
