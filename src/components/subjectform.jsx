import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import "./subjectform.css";
import { useAdminContext } from "../context/AdminContext";
import useRequireAuth from "../hooks/useRequireAuth";
const baseURL = process.env.REACT_APP_BASE_URL;

const Subjectform = () => {
  const { id, userid } = useParams();
  const form_id = id;
  const [totalcheckboxes, setTotalcheckboxes] = useState(0);
  const [requiredcheckboxes, setRequiredcheckboxes] = useState(0);

  const [subjectsData, setSubjectsData] = useState([]);
  const [checkedBoxes, setCheckedBoxes] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]); // State to store selected subjects
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { setAdminName, setAdminEmail } = useAdminContext();

  useRequireAuth(isAuthenticated);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Check if userid is not present
        if (!userid) {
          const authResponse = await fetch(`${baseURL}/checkauthentication`, {
            credentials: "include",
          });

          if (!authResponse.ok) {
            setIsAuthenticated(false);
            history.push("/"); // Redirect to home if not authenticated
            return;
          }
          const authData = await authResponse.json();
          setAdminName(authData.user_name);
          setAdminEmail(authData.user_email);
        }

        const formResponse = await fetch(
          `${baseURL}/getsubjectformdata/${form_id}`
        );
        const formData = await formResponse.json();
        setSubjectsData(formData); // Set subjectsData state with fetched data
        setTotalcheckboxes(formData.length);
        setRequiredcheckboxes(formData[0].selectable);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [userid, history]); // Include userid and history as dependencies

  const handleCheckboxChange = (checkboxIndex) => {
    if (checkedBoxes.includes(checkboxIndex)) {
      setCheckedBoxes((prevCheckedBoxes) =>
        prevCheckedBoxes.filter((index) => index !== checkboxIndex)
      );
    } else {
      if (checkedBoxes.length < requiredcheckboxes) {
        setCheckedBoxes((prevCheckedBoxes) => [
          ...prevCheckedBoxes,
          checkboxIndex,
        ]);
      }
    }
  };

  const isChecked = (checkboxIndex) => {
    return checkedBoxes.includes(checkboxIndex);
  };

  const isSubmitDisabled = checkedBoxes.length < requiredcheckboxes;

  const handleSubmit = async () => {
    const selectedSubjectsData = checkedBoxes.map((index) => subjectsData[index]);
    console.log("Selected Subjects:", selectedSubjectsData);

    // Check if userid is present
    if (userid) {
      try {
        // Make a post request to subjectregisterpage and send data
        const response = await fetch(`${baseURL}/subjectregister`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userid: userid,
            selectedSubjects: selectedSubjectsData,
          }),
        });

        if (response.ok) {
          console.log("Data successfully sent to subjectregisterpage!");
        } else {
          console.error("Failed to send data to subjectregisterpage");
        }
      } catch (error) {
        console.error("Error sending data to subjectregisterpage:", error);
      }
    }
  };

  return (
    <>
      <div className="subjectRegformPageContainer">
        <div className="subjectRegformPage">
          <div className="FormContainer">
            <div className="checkboxes">
              <div className="checkboxesheader">
                <h1>
                  Select {requiredcheckboxes} Subjects out of {totalcheckboxes}
                </h1>
              </div>
              <div className="checkboxesData">
                {subjectsData.map((subject, index) => (
                  <div key={index} className="checkbox">
                    <input
                      type="checkbox"
                      id={`checkbox-${index}`}
                      checked={isChecked(index)}
                      onChange={() => handleCheckboxChange(index)}
                    />
                    <label htmlFor={`checkbox-${index}`}>
                      {subject.SubjectName}
                    </label>
                  </div>
                ))}
                {isSubmitDisabled ? (
                  <p style={{ color: "red", textAlign: "center", marginTop: "40px" }}>
                    {`Please select ${
                      requiredcheckboxes - checkedBoxes.length
                    } more checkboxes.`}
                  </p>
                ) : (
                  <button className="submit-btn" onClick={handleSubmit}>
                    SUBMIT
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subjectform;