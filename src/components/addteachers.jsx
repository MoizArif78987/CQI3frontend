import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useAdminContext } from '../context/AdminContext';
import useRequireAuth from "../hooks/useRequireAuth";
import JsonToCsv from "react-json-to-csv";
import Papa from "papaparse";
import "./addadmin.css";
import Topnav from "./topnav";
import Sidenav from "./sidenav";
import delIcon from'../images/del-icon.png'

const baseURL = process.env.REACT_APP_BASE_URL;

export default function Addteachers() {
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { setAdminName } = useAdminContext();
  const { setAdminEmail } = useAdminContext();
  const { darkmode } = useAdminContext();

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
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "" });
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewTeacher((prevTeacher) => ({ ...prevTeacher, [name]: value }));
  };

  const handleAddTeacher = (event) => {
    event.preventDefault();
    if (
      newTeacher.name.trim() !== "" &&
      newTeacher.email.trim() !== "" &&
      selectedSection !== "" &&
      selectedSemester !== ""
    ) {
      setJsonData((prevData) => [
        ...prevData,
        {
          Name: newTeacher.name,
          Email: newTeacher.email,
          Section: selectedSection,
          Semester: selectedSemester,
        },
      ]);
      setNewTeacher({ name: "", email: "" });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
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
  };

  const handleConfirmBtnClick = async () => {
    try {
      const response = await fetch(`${baseURL}/addteacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        // Handle success, maybe show a success message or redirect
        console.log("Teachers added successfully!");
        setJsonData([]);
      } else {
        // Handle error, maybe show an error message
        console.error("Failed to add teachers.");
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
          <Sidenav active="Teachers" />
          <div className="addAdminPageContainer">
            <div className="manualcard">
              <form>
                <input
                  type="text"
                  placeholder="Enter New Teacher Name"
                  name="name"
                  value={newTeacher.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="email"
                  placeholder="Enter New Teacher Email"
                  name="email"
                  value={newTeacher.email}
                  onChange={handleInputChange}
                  required
                />
                
                <button className="add-btn" onClick={handleAddTeacher}>
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
              <button className="csv-btn" onClick={handleButtonClick}>
                Add Through .csv
              </button>
              <div className="dropdowns">
                  <label>Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    required
                  >
                    <option value="">Select Semester</option>
                    {/* Add semester options */}
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                  </select>
                  
                  <label>Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    required
                  >
                    <option value="">Select Section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="S">S</option>
                  </select>
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
                            <button className="del-btn" onClick={() => handleDelete(index)}>
                              <img src={delIcon} alt="Loading" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="ConfirmBtn">
                    <button onClick={handleConfirmBtnClick}>Confirm</button>
                  </div>
                </div>
              ) : (
                <center>
                  <h1>Add Teachers </h1>
                </center>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
