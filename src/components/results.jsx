import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Topnav from "./topnav";
import Sidenav from "./sidenav";
import useRequireAuth from "../hooks/useRequireAuth";
import { useAdminContext } from "../context/AdminContext";
import "./results.css";
const baseURL = process.env.REACT_APP_BASE_URL;

const Result = () => {
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { setAdminName, setAdminEmail } = useAdminContext();
  const [selectedCategory, setSelectedCategory] = useState("Student");
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSection, setSelectedSection] = useState("");
  const [resultData, setResultData] = useState([]);
  const [uniqueTeachers, setUniqueTeachers] = useState([]);
  const [uniqueQuestions, setUniqueQuestions] = useState([]);
  const [semesterDates, setSemesterDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // New state for selected date

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

  useEffect(() => {
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

    fetchSemesterDates();
  }, []);

  useEffect(() => {
    // Extract unique teacher names and questions
    const teachersSet = new Set(resultData.map((item) => item.teacher_name));
    const questionsSet = new Set(resultData.map((item) => item.question_text));
    setUniqueTeachers(Array.from(teachersSet));
    setUniqueQuestions(Array.from(questionsSet));
  }, [resultData]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);

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

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleRetreiveDataClick = async () => {
    if (
      selectedSemester !== null &&
      selectedSection !== ""
    ) {
      if( selectedDate == "")
      {
        setSelectedDate(null);
      }
      const dataSent = {
        category: selectedCategory,
        semester: selectedSemester,
        section: selectedSection,
        date: selectedDate, // Include selected date in the data sent to backend
      };

      try {
        const response = await fetch(`${baseURL}/getresponses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataSent),
        });

        if (!response.ok) {
          throw new Error("Failed to retrieve data");
        }

        const responseData = await response.json();
        setResultData(responseData.responseTable);
      } catch (error) {
        console.error("Error:", error);
        // Handle the error case, such as displaying an error message
      }
    } else {
      window.alert("Semester, section, and date values cannot be null.");
    }
  };

  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + formatDataToCSV();
    const encodedURI = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute(
      "download",
      `Result_${selectedCategory}_${selectedSemester}_${selectedSection}.csv`
    );
    document.body.appendChild(link);
    link.click();
  };

  const formatDataToCSV = () => {
    let csv = "Questions,";
    uniqueTeachers.forEach((teacher, index) => {
      csv += `${teacher} Disagree,${teacher} Agree${
        index === uniqueTeachers.length - 1 ? "\n" : ","
      }`;
    });
    uniqueQuestions.forEach((question, qIndex) => {
      // Enclose each question within double quotes
      csv += `"${question}",`;
      uniqueTeachers.forEach((teacher, tIndex) => {
        const correspondingData = resultData.find(
          (item) =>
            item.teacher_name === teacher && item.question_text === question
        );
        if (correspondingData) {
          csv += `${correspondingData.averages[0]},${correspondingData.averages[1]}`;
        }
        csv += tIndex === uniqueTeachers.length - 1 ? "\n" : ",";
      });
    });
    return csv;
  };

  return (
    <>
      <div className="ResultPage">
        <Topnav />
        <div className="ContainerWithSideNav">
          <Sidenav active="Results" />
          <div className="ResultPageContainer">
            <div className="resultInputs">
              <div className="Category">
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
              </div>
              <div className="restOfTheInputs">
                {selectedCategory === "Student" ? (
                  <>
                    <label>Semester</label>
                    <select
                      value={selectedSemester || ""}
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
                ) : null}
                {selectedCategory === "Final Year Student" ||
                selectedCategory === "Student" ? (
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
                {/* Dropdown for selecting semester dates */}
                {selectedCategory === "Student" ||
                selectedCategory === "Final Year Student" ? (
                  <>
                    <label>Semester Date</label>
                    <select
                      value={selectedDate}
                      onChange={handleDateChange}
                      required
                    >
                      <option value="">Select Semester Date</option>
                      {semesterDates.map((date, index) => (
                        <option key={index} value={date}>
                          {date}
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}
              </div>
            </div>
            <div className="resultDisplayAndDownload">
              <div className="resultDisplay">
                <table className="customTable">
                  <thead>
                    <tr>
                      <th>Questions</th>
                      {uniqueTeachers.map((teacher, index) => (
                        <React.Fragment key={index}>
                          <th colSpan="2">{teacher}</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueQuestions.map((question, qIndex) => (
                      <React.Fragment key={qIndex}>
                        <tr className={qIndex % 2 === 0 ? "evenRow" : "oddRow"}>
                          <td rowSpan="2">{question}</td>
                          {uniqueTeachers.map((teacher, tIndex) => {
                            const correspondingData = resultData.find(
                              (item) =>
                                item.teacher_name === teacher &&
                                item.question_text === question
                            );
                            return (
                              <React.Fragment key={tIndex}>
                                <td>{correspondingData ? "Disagree" : ""}</td>
                                <td>
                                  {correspondingData
                                    ? correspondingData.averages[0]
                                    : ""}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                        <tr className={qIndex % 2 === 0 ? "evenRow" : "oddRow"}>
                          {uniqueTeachers.map((teacher, tIndex) => {
                            const correspondingData = resultData.find(
                              (item) =>
                                item.teacher_name === teacher &&
                                item.question_text === question
                            );
                            return (
                              <React.Fragment key={tIndex}>
                                <td>{correspondingData ? "Agree" : ""}</td>
                                <td>
                                  {correspondingData
                                    ? correspondingData.averages[1]
                                    : ""}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>{" "}
              </div>

              <div className="downloadButton">
                <div className="retreiveBtn">
                  <button onClick={handleRetreiveDataClick}>
                    Retrieve Data
                  </button>
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
export default Result;
