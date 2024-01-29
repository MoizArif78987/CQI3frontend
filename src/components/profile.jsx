import React from "react";
import { useState } from "react";
import "./profile.css";
import Topnav from "./topnav";
import Sidenav from "./sidenav";
import pfp from '../images/pfp.png'
import { useAdminContext } from '../context/AdminContext';
import { useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import useRequireAuth from "../hooks/useRequireAuth"
const baseURL = process.env.REACT_APP_BASE_URL;

export default function Profile() {


  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { setAdminName } = useAdminContext();
  const { setAdminEmail } = useAdminContext();

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
          setAdminEmail(data.user_email);
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
  }, [history, isAuthenticated]);


  const { adminName } = useAdminContext();
  const { adminEmail } = useAdminContext();

  const [profile, setProfile] = useState({ Name: adminName, Email: adminEmail, Password: 'SuperAdminUET' });
  const HandleInputChange = (event) => {
    const { name, value } = event.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };
  
  return (
    <>
      <div className="profilePage">
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
                  <input type="text" name="Name" value={profile.Name} onChange={HandleInputChange}/>
                </div>
                <div className="labelDiv">
                  <label>Email</label>
                  <input type="email" name="Email" value={profile.Email} onChange={HandleInputChange}/>
                </div>
                <div className="labelDiv">
                  <label>Password</label>
                  <input type="password" name="Password" value={profile.Password} onChange={HandleInputChange}/>
                </div>
                <button>Update</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
