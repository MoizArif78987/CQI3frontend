import React from "react";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useAdminContext } from '../context/AdminContext';
import useRequireAuth from "../hooks/useRequireAuth"
import Papa from "papaparse";
import "./addusers.css";
import Topnav from "./topnav";
import Sidenav from "./sidenav";
import delIcon from "../images/del-icon.png";
const baseURL = process.env.REACT_APP_BASE_URL;


export default function Addusers() {


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



  const fileInputRef = useRef(null);
  const [jsonData, setJsonData] = useState([]);
  const [newuser, setNewuser] = useState({ name: "", email: "" });
  const [selectedCategory, setSelectedCategory] = useState("Student");
  const [selectedSemester, setSelectedSemester] = useState(-1);
  const [userDetails, setUserDetails] = useState([]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewuser((prevuser) => ({ ...prevuser, [name]: value }));
  };

  const handleAdduser = (event) => {
    event.preventDefault();
    if (newuser.name.trim() !== "" && newuser.email.trim() !== "") {
      setUserDetails((prevDetails) => [
        ...prevDetails,
        {
          Name: newuser.name,
          Email: newuser.email,
          Category: selectedCategory,
          Semester: selectedSemester,
        },
      ]);
  
      setJsonData((prevData) => [
        ...prevData,
        { Name: newuser.name, Email: newuser.email },
      ]);
      setNewuser({ name: "", email: "" });
    }
  };
  
  const handleUploadBtnClick = () => {
    if (selectedSemester != -1) {
      fileInputRef.current.click();
    } else {
      window.alert("Select Semester First");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target.result;
        parseCSV(contents);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csvContent) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (parsedData) => {
        const { data } = parsedData;

        if (data && Array.isArray(data) && data.length > 0) {
          const headers = Object.keys(data[0]);

          const newData = data.map((row) => {
            const rowData = {};
            headers.forEach((header) => {
              rowData[header] = row[header];
            });
            return rowData;
          });

          setJsonData((prevData) => [...prevData, ...newData]);

          const userDetailsFromCSV = newData.map((user) => ({
            Name: user.Name,
            Email: user.Email,
            Category: selectedCategory,
            Semester: selectedSemester,
          }));

          setUserDetails((prevDetails) => [
            ...prevDetails,
            ...userDetailsFromCSV,
          ]);
        }
      },
      error: (error) => {
        console.error("CSV Parsing Error:", error);
      },
    });
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
      const response = await fetch(`${baseURL}/addusers`, {
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
      <div className="addadminPage">
        <Topnav />
        <div className="ContainerWithSideNav">
          <Sidenav active="Users" />
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
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <button className="csv-btn" onClick={handleUploadBtnClick}>
                Add Through .csv
              </button>

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
                {selectedCategory === "Student" ||
                selectedCategory === "Final Year Student" ? (
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
                      <option value="8">8</option>
                    </select>
                  </>
                ) : null}
              </div>
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
                    <button onClick={HandleConfirmBtnClick}>Confirm</button>
                  </div>
                </div>
              ) : (
                <center>
                  <h1>Add Users </h1>
                </center>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
