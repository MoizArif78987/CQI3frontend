import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import BeatLoader from "react-spinners/BeatLoader";
import "./editform.css";
import { useAdminContext } from "../context/AdminContext";
import useRequireAuth from "../hooks/useRequireAuth";
import Topnav from "./topnav";

const baseURL = process.env.REACT_APP_BASE_URL;

export default function EditForm() {
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { setAdminName, setAdminEmail, darkmode } = useAdminContext();

  const { id } = useParams();
  const form_id = id;
  const [formdata, setFormdata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchData = async () => {
      try {
        // Check if form_id is present
        if (!form_id) {
          console.error("Missing form_id in the URL");
          history.push("/"); // Redirect or handle missing form_id
          setIsAuthenticated(false);
          return;
        }

        // Fetch form data
        const formResponse = await fetch(`${baseURL}/getformdata/${form_id}`);
        const formData = await formResponse.json();
        if (formResponse.ok) {
          setFormdata(formData);
          setIsLoading(false);
        }

      } catch (error) {
        console.error("Error fetching form data:", error);
        setFormdata(null);
        setIsLoading(true);
      }
    };

    fetchData();
  }, [form_id, history, setIsAuthenticated]);

  const handleInputChange = (topicIndex, questionIndex, value) => {
    const updatedFormData = { ...formdata };
    updatedFormData.titles[topicIndex].questions[questionIndex].question = value;
    setFormdata(updatedFormData);
  };

  const handleSaveChanges = async () => {
    console.log(formdata)
    try {
      // Make a POST request to save the edited form data
      const response = await fetch(`${baseURL}/editform`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });

      if (response.ok) {
        // Handle success, maybe redirect to the form page
        console.log("Form edited successfully!");
        history.push(`/form/${form_id}`);
      } else {
        // Handle error cases
        console.error("Error editing form:", response.statusText);
      }
    } catch (error) {
      console.error("Error editing form:", error);
    }
  };

  const renderEditForm = () => {
    if (!formdata) {
      return <div>Loading...</div>;
    }

    return (
      <div className={`EditFormPage ${darkmode ? 'dark-mode' : ''}`}>
        <Topnav />
        <div className="header">
          <h1>Edit Form</h1>
          <h2>{formdata.formTitle}</h2>
        </div>

        <div className="FormContainer">
          {formdata.titles.map((topic, topicIndex) => (
            <div key={topicIndex} className="Topic">
              <h3>{topic.title}</h3>
              <div className="FormQuestions">
                {topic.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="QuestionContainer">
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) =>
                        handleInputChange(topicIndex, questionIndex, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="save-btn">
        <button onClick={handleSaveChanges}>
          Save Changes
        </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {isLoading ? (
        <div className="EditFormPage">
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BeatLoader
              color="#053872"
              size={10}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        </div>
      ) : (
        renderEditForm()
      )}
    </>
  );
}
