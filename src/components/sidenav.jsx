import React, { useState } from "react";
import {Link} from "react-router-dom";
import "./sidenav.css";

export default function Sidenav(props) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <button className="toggle" onClick={toggleSidebar}>
        <div className="toggle-line"></div>
        <div className="toggle-line"></div>
        <div className="toggle-line"></div>
      </button>
      <div className={`sidenav ${collapsed ? "collapsed" : ""}`}>
        <div className="content">
        {
            props.active === 'Stats'?
            <Link to='/adminpanel'><button className="sidenavbtn" style={{color:'rgb(33, 170, 255)', borderBottomColor: 'rgb(33, 170, 255)'}}>Stats</button></Link>
            :
            <Link to='/adminpanel'><button className="sidenavbtn">Stats</button></Link>
          }
          {
            props.active === 'Forms'?
            <Link to='/forms'><button className="sidenavbtn" style={{color:'rgb(33, 170, 255)', borderBottomColor: 'rgb(33, 170, 255)'}}>Forms</button></Link>
            :
            <Link to='/forms'><button className="sidenavbtn">Forms</button></Link>
          }
          {
            props.active === 'Admins'?
            <Link to='/addadmin'><button className="sidenavbtn" style={{color:'rgb(33, 170, 255)', borderBottomColor: 'rgb(33, 170, 255)'}}>Admins</button></Link>
            :
            <Link to='/addadmin'><button className="sidenavbtn">Admins</button></Link>
          }
          {
            props.active === 'Users'?
            <Link to='/addusers'><button className="sidenavbtn" style={{color:'rgb(33, 170, 255)', borderBottomColor: 'rgb(33, 170, 255)'}}>Users</button></Link>
            :
            <Link to='/addusers'><button className="sidenavbtn">Users</button></Link>
          }
          {
            props.active === 'Teachers'?
            <Link to='/addteachers'><button className="sidenavbtn" style={{color:'rgb(33, 170, 255)', borderBottomColor: 'rgb(33, 170, 255)'}}>Teachers</button></Link>
            :
            <Link to='/addteachers'><button className="sidenavbtn">Teachers</button></Link>
          }
          {
            props.active === 'Profile'?
            <Link to='/profile'><button className="sidenavbtn" style={{color:'rgb(33, 170, 255)', borderBottomColor: 'rgb(33, 170, 255)'}}>Profile</button></Link>
            :
            <Link to='/profile'><button className="sidenavbtn">Profile</button></Link>
          }
          <button className="sidenavbtn">Results</button>
        </div>
      </div>
    </>
  );
}
