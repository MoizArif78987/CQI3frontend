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
  const [selectedSubject, setSelectedSubject] = useState("");

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
          console.log(data);
        } else {
          console.error("Failed to fetch subject list");
        }
      } catch (error) {
        console.error("Error fetching subject list:", error);
      }
    };

    checkAuthentication();
    fetchSubjectList();
  }, [history, isAuthenticated, setAdminName, setAdminEmail]);

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
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
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                >
                  <option value="">Select Subject</option>
                  {subjectList.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.SubjectName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="restOfTheInputs"></div>
            </div>
            <div className="resultDisplayAndDownload">
              <div className="resultDisplay"></div>

              <div className="downloadButton">
                <div className="retreiveBtn">
                  <button>Retrieve Data</button>
                </div>
                <div className="dnldBtn">
                  <button>Download .csv</button>
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
