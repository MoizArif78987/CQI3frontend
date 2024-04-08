import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Topnav from "./topnav";
import Sidenav from "./sidenav";
import useRequireAuth from "../hooks/useRequireAuth";
import { useAdminContext } from "../context/AdminContext";
import "./results.css";
const baseURL = process.env.REACT_APP_BASE_URL;

const ResultSubjectRegistration = () => {
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { setAdminName, setAdminEmail } = useAdminContext();
  const [subjectList, setSubjectList] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState({ id: "", name: "" });
  const [responseData, setResponseData] = useState(null); // State to hold response data
  const [semesterDates, setSemesterDates] = useState([]); // State to hold semester dates
  const [selectedDate, setSelectedDate] = useState(""); // State for selected date

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

    const fetchSubjectList = async () => {
      try {
        const response = await fetch(`${baseURL}/getsubjectlist`);
        if (response.ok) {
          const data = await response.json();
          setSubjectList(data);
        } else {
          console.error("Failed to fetch subject list");
        }
      } catch (error) {
        console.error("Error fetching subject list:", error);
      }
    };

    const fetchSemesterDates = async () => {
      try {
        const response = await fetch(`${baseURL}/getsemesters`);

        if (response.ok) {
          const data = await response.json();
          setSemesterDates(data.semesterDates);
        } else {
          throw new Error("Failed to fetch semester dates");
        }
      } catch (error) {
        console.error("Error fetching semester dates:", error);
        // Handle the error case, such as displaying an error message
      }
    };

    checkAuthentication();
    fetchSubjectList();
    fetchSemesterDates();
  }, [history, isAuthenticated, setAdminName, setAdminEmail]);

  const handleSubjectChange = (event) => {
    const selectedSubjectName = event.target.value;
    const selectedSubjectId = subjectList.find(
      (subject) => subject.SubjectName === selectedSubjectName
    );
    setSelectedSubject({ id: selectedSubjectId, name: selectedSubjectName });
  };

  const handleRetrieveData = async () => {
    // Check if a subject is selected
    if (!selectedSubject.name) {
      window.alert("Please select a subject");
      return;
    }

    try {
      const response = await fetch(
        `${baseURL}/getregisteredstudents?subjectId=${selectedSubject.id.id}&subjectName=${selectedSubject.name}&date=${selectedDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setResponseData(data); // Store response data in state
        console.log("Data retrieved successfully:", data);
      } else {
        console.error("Failed to retrieve data");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + formatDataToCSV();
    const encodedURI = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", `${selectedSubject.name}_StudentList.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const formatDataToCSV = () => {
    if (!responseData) return "";

    const csvRows = [];
    const headers = ["Name", "Email", "Semester", "Section"];

    // Add headers to CSV
    csvRows.push(headers.join(","));

    // Add data rows to CSV
    responseData.forEach((student) => {
      const row = [
        student.Name,
        student.Email,
        student.Semester,
        student.Section,
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <>
      <div className="ResultPage">
        <Topnav />
        <div className="ContainerWithSideNav">
          <Sidenav active="Registered Subjects" />
          <div className="ResultPageContainer">
            <div className="resultInputs">
              <div className="Category">
                <label>Select Subject:</label>
                <select
                  value={selectedSubject.name}
                  onChange={handleSubjectChange}
                >
                  <option value="">Select Subject</option>
                  {subjectList.map((subject) => (
                    <option key={subject.id} value={subject.SubjectName}>
                      {subject.SubjectName}
                    </option>
                  ))}
                </select>
              </div>
              {/* Display dropdown for selecting semester date */}
              <div className="SemesterDate">
                <label>Select Semester Date:</label>
                <select value={selectedDate} onChange={handleDateChange}>
                  <option value="">Select Date</option>
                  {semesterDates.map((date, index) => (
                    <option key={index} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="resultDisplayAndDownload">
              <div className="resultDisplay">
                {/* Display response data here */}
                {responseData && (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Semester</th>
                        <th>Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responseData.map((student, index) => (
                        <tr key={index}>
                          <td>{student.Name}</td>
                          <td>{student.Email}</td>
                          <td>{student.Semester}</td>
                          <td>{student.Section}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="downloadButton">
                <div className="retreiveBtn">
                  <button onClick={handleRetrieveData}>Retrieve Data</button>
                </div>
                <div className="dnldBtn">
                  <button onClick={downloadCSV}>Download .csv</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ResultSubjectRegistration;
