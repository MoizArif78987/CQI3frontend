import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useAdminContext } from "../context/AdminContext";
import useRequireAuth from "../hooks/useRequireAuth";
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
  const [selectedSection, setSelectedSection] = useState("");
  const [userDetails, setUserDetails] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(null); // State to hold current date and time

  useEffect(() => {
    setCurrentDateTime(new Date().toISOString());
  }, []);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);

    // If the selected category is "Final Year Student," set the semester to 8
    if (event.target.value === "Final Year Student") {
      setSelectedSemester(8);
    } else {
      setSelectedSemester(-1);
      setSelectedSection("X");
    }
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewuser((prevuser) => ({ ...prevuser, [name]: value }));
  };

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleAdduser = (event) => {
    event.preventDefault();

    if (
      (newuser.name.trim() !== "" &&
        newuser.email.trim() !== "" &&
        selectedCategory !== "Student" &&
        selectedCategory !== "Final Year Student") ||
      (selectedSemester !== null &&
        selectedSemester !== -1 &&
        selectedSection !== null &&
        selectedSection !== "X")
    ) {
      setUserDetails((prevDetails) => [
        ...prevDetails,
        {
          Name: newuser.name,
          Email: newuser.email,
          Category: selectedCategory,
          Semester: selectedSemester,
          Section: selectedSection,
        },
      ]);

      setJsonData((prevData) => [
        ...prevData,
        { Name: newuser.name, Email: newuser.email, Section: selectedSection },
      ]);

      setNewuser({ name: "", email: "" });
    } else {
      // Display an error message or handle the invalid input case
      console.log("Invalid input. Please check your entries.");
    }
  };

  const handleUploadBtnClick = () => {
    if (
      (selectedCategory === "Student" &&
        selectedSemester !== -1 &&
        selectedSection.trim() !== "") ||
      (selectedCategory === "Final Year Student" &&
        selectedSemester === 8 &&
        selectedSection.trim() !== "") ||
      ((selectedCategory === "Organization" || selectedCategory === "Alumni") &&
        selectedSemester === -1 &&
        selectedSection.trim() !== "")
    ) {
      fileInputRef.current.click();
    } else {
      window.alert("Select Semester and Section First");
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
            Section: selectedSection,
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

  const handleMarkSemesterEnd = async () => {
    try {
      const response = await fetch(`${baseURL}/marksemesterend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error("Failed to mark semester end");
      }

      // Handle success
      console.log("Semester marked as ended successfully");
    } catch (error) {
      console.error("Error marking semester end:", error);
    }
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
              <div className="marksemesterend">
                <button onClick={handleMarkSemesterEnd}>Mark Semester End</button>
              </div>
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
              <div className="section">
                {selectedCategory === "Student" ||
                selectedCategory === "Final Year Student" ? (
                  <>
                    <label>Section</label>
                    <select
                      value={selectedSection}
                      onChange={handleSectionChange}
                      required
                    >
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="S">S</option>
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
