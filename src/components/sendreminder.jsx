import React, { useRef, useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useAdminContext } from "../context/AdminContext";
import useRequireAuth from "../hooks/useRequireAuth";
import "./addusers.css";
import Topnav from "./topnav";
import Sidenav from "./sidenav";
import delIcon from "../images/del-icon.png";
const baseURL = process.env.REACT_APP_BASE_URL;

export default function SendReminder() {
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { setAdminName, setAdminEmail , darkmode} = useAdminContext();

  useRequireAuth(isAuthenticated);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${baseURL}/checkauthentication`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setAdminName(data.user_name);
          setAdminEmail(data.user_email);
        } else {
          history.push("/");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        history.push("/");
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [history, isAuthenticated]);

  const fileInputRef = useRef(null);
  const [jsonData, setJsonData] = useState([]);
  const [newuser, setNewuser] = useState({ name: "", email: "" });
  const [selectedCategory, setSelectedCategory] = useState("Student");
  const [selectedSemester, setSelectedSemester] = useState(-1);
  const [userDetails, setUserDetails] = useState([]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);

    if (event.target.value === "Final Year Student") {
      setSelectedSemester(8);
    } else {
      setSelectedSemester(-1);
    }
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewuser((prevuser) => ({ ...prevuser, [name]: value }));
  };

  const handleAdduser = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${baseURL}/getstudentsbyname`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newuser.name,
          email: newuser.email,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Check if data.users is not empty before processing
        if (data.users && data.users.length > 0) {
          const newdata = data.users[0];
  
          // Check if the user is not already in jsonData
          const isUserAlreadyAdded = jsonData.some(
            (item) => item.Name === newdata.Name && item.Email === newdata.Email
          );
  
          if (!isUserAlreadyAdded) {
            setUserDetails((prevDetails) => [
              ...prevDetails,
              {
                ID: newdata.ID,
                Name: newdata.Name,
                Email: newdata.Email,
                Category: newdata.Category,
                Semester: newdata.Semester,
              },
            ]);
  
            setJsonData((prevData) => [
              ...prevData,
              { Name: newdata.Name, Email: newdata.Email },
            ]);
  
            setNewuser({ name: "", email: "" });
          } else {
            console.log("User already exists in jsonData");
          }
        }
      } else {
        // Handle other response status codes if needed
      }
    } catch (error) {
      console.error("Error adding or retrieving user:", error);
    }
  };
  
  const handleImportFromDatabase = async () => {
    try {
      const response = await fetch(`${baseURL}/getstudentsbycategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory,
          semester:
            selectedCategory === "Final Year Student" ? 8 : selectedSemester,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Check if data.students is not empty before processing
        if (data.students && data.students.length > 0) {
          const newUsers = data.students.filter(
            (student) =>
              !jsonData.some(
                (item) => item.Name === student.Name && item.Email === student.Email
              )
          );
  
          setUserDetails((prevDetails) => [...prevDetails, ...newUsers]);
  
          setJsonData((prevData) => [
            ...prevData,
            ...newUsers.map((user) => ({ Name: user.Name, Email: user.Email , Section: user.Section,})),
          ]);
  
          setNewuser({ name: "", email: "" });
        }
      } else {
        throw new Error("Failed to import students from the database");
      }
    } catch (error) {
      console.error("Error importing students:", error);
    }
  };
  

  const handleDelete = (indexToDelete) => {
    const updatedData = jsonData.filter((_, index) => index !== indexToDelete);
    setJsonData(updatedData);
    setUserDetails((prevDetails) =>
      prevDetails.filter((_, index) => index !== indexToDelete)
    );
  };

  const HandleConfirmBtnClick = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${baseURL}/sendreminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to submit the data");
      }

      const responseData = await response.json();
      if (responseData != null) {
        setJsonData([]);
        setUserDetails([]);
        setSelectedCategory("Student");
        setSelectedSemester(-1);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className={`addadminPage ${darkmode ? 'dark-mode' : ''}`}>
        <Topnav />
        <div className="ContainerWithSideNav">
          <Sidenav active="Send Reminders" />
          <div className="addAdminPageContainer">
            <div className="manualcard">
              <form>
                <input
                  type="text"
                  placeholder="Enter New User Name"
                  name="name"
                  value={newuser.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="email"
                  placeholder="Enter New User Email"
                  name="email"
                  value={newuser.email}
                  onChange={handleInputChange}
                  required
                />
                <button className="add-btn" onClick={handleAdduser}>
                  Add
                </button>
              </form>

              <div className="dropdowns">
                <label>Category</label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <option value="Student">Student</option>
                  <option value="Final Year Student">Final Year Student</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Organization">Organization</option>
                </select>
                {selectedCategory === "Student" && (
                  <>
                    <label>Semester</label>
                    <select
                      value={selectedSemester}
                      onChange={handleSemesterChange}
                    >
                      <option value="">Select Semester</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                    </select>
                  </>
                )}
              </div>
              <button className="csv-btn" onClick={handleImportFromDatabase}>
                Import from Database
              </button>
            </div>
            <div className="autoDataCard">
              {jsonData && jsonData.length > 0 ? (
                <div className="ListTable">
                  <table className="customTable">
                    <thead>
                      <tr>
                        <th>Sr#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jsonData.map((item, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "evenRow" : "oddRow"}
                        >
                          <td>{index + 1}</td>
                          <td>{item.Name}</td>
                          <td>{item.Email}</td>
                          <td>
                            <button
                              className="del-btn"
                              onClick={() => handleDelete(index)}
                            >
                              <img src={delIcon} alt="Loading" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="ConfirmBtn">
                    <button onClick={HandleConfirmBtnClick}>Send</button>
                  </div>
                </div>
              ) : (
                <center>
                  <h1>Choose User to Send Reminder</h1>
                </center>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
