import React, { useState, useEffect } from "react";
import "./authorization.css";
import uetLogo from "../images/uet-lahore-logo.png";
import { Link, useHistory } from "react-router-dom/cjs/react-router-dom";
import { useAdminContext } from '../context/AdminContext';
const baseURL = process.env.REACT_APP_BASE_URL;


export default function Authorization() {
  const history = useHistory();
  const { setAdminName } = useAdminContext();
  const { setAdminEmail } = useAdminContext();
  
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Send a request to the server to check authentication
        const response = await fetch(`${baseURL}/checkauthentication`, {
          credentials: 'include',
        });

        if (response.ok) {
          // Authentication successful, redirect to Adminpanel
          const data = await response.json();
          setAdminName(data.user_name);
          setAdminEmail(data.user_email);
          history.push('/adminpanel');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuthentication();
  }, [history, setAdminName]);

  // State variable for form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Event handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send data to the backend
      const response = await fetch(`${baseURL}/authorization`, {
        credentials:'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      setAdminName(data.user_name);
      setAdminEmail(data.user_email);

      // If authentication is successful, go to the admin panel
      history.push("/adminpanel");
    } catch (error) {
      console.error("Error:", error);
      // Handle authentication failure
    }
  };

  // Event handler for updating form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      <div className="authPage">
        <div className="LoginContainer">
          <div className="cardheader">
            <img src={uetLogo} alt="Loading..." />
            <h1>CQI</h1>
          </div>
          <div className="loginCard">
            <div className="innercardheader">
              <h2>Sign In</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ipt">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="ipt">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="btnDiv">
                <div className="linkbtnDiv">
                  <button type="submit">Sign In</button>
                </div>
              </div>
              <div className="forgotPassword">
                <p>forgot password?</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
