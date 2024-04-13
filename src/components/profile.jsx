import React, { useState, useContext } from "react"; // Step 1
import "./profile.css";
import Topnav from "./topnav";
import Sidenav from "./sidenav";
import pfp from '../images/pfp.png';
import { useAdminContext } from '../context/AdminContext';
import { useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import useRequireAuth from "../hooks/useRequireAuth";
const baseURL = process.env.REACT_APP_BASE_URL;

export default function Profile() {
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { setAdminName, adminEmail,darkmode } = useAdminContext();

  useRequireAuth(isAuthenticated);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${baseURL}/checkauthentication`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAdminName(data.user_name);
        }
        else{
          history.push('/');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        history.push('/');
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [history, isAuthenticated, setAdminName]);

  const { adminName } = useAdminContext();

  const [profile, setProfile] = useState({ Name: adminName, Email: adminEmail, Password: 'SuperAdminUET' });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`${baseURL}/updateInfo`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          adminEmail: adminEmail,
        }),
      });

      if (response.ok) {
        console.log('Profile updated successfully');
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  return (
    <>
      <div className={`profilePage  ${darkmode ? 'dark-mode' : ''}`}>
        <Topnav />
        <div className="ContainerWithSideNav">
          <Sidenav active="Profile" />
          <div className="profilePageContainer">
            <div className="profilecard">
              <div className="imageDiv">
                <div className="imageContainer">
                  <img src={pfp} alt="Loading" />
                </div>
              </div>
              <form>
                <div className="labelDiv">
                  <label>Name</label>
                  <input type="text" name="Name" value={profile.Name} onChange={handleInputChange}/>
                </div>
                <div className="labelDiv">
                  <label>Email</label>
                  <input type="email" name="Email" value={profile.Email} onChange={handleInputChange}/>
                </div>
                <div className="labelDiv">
                  <label>Password</label>
                  <input type="password" name="Password" value={profile.Password} onChange={handleInputChange}/>
                </div>
                <button type="button" onClick={handleUpdateProfile}>Update</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
