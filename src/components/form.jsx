import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import BeatLoader from "react-spinners/BeatLoader";
import "./form.css";
import { useAdminContext } from "../context/AdminContext";
import useRequireAuth from "../hooks/useRequireAuth";
import Topnav from "./topnav";
import Formnav from "./formnav";

const baseURL = process.env.REACT_APP_BASE_URL;

export default function Form() {
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { setAdminName, setAdminEmail, darkmode } = useAdminContext();

  const { id, userid, teacherid } = useParams();
  const form_id = id;
  const [percentages, setPercentages] = useState([]);
  const [formdata, setFormdata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [textResponses, setTextResponses] = useState({});

  useRequireAuth(isAuthenticated);

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

        // If userid is present, do not perform authentication check
        if (!userid) {
          const authResponse = await fetch(`${baseURL}/checkauthentication`, {
            credentials: "include",
          });

          if (!authResponse.ok) {
            // Redirect or handle authentication failure
            history.push("/");
            setIsAuthenticated(false);
            return;
          }

          const authData = await authResponse.json();
          setAdminName(authData.user_name);
          setAdminEmail(authData.user_email);
        }
        const responseExistenceResponse = await fetch(`${baseURL}/checkresponseexistance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ form_id, user_id: userid, teacher_id: teacherid }),
        });
  
        if (!responseExistenceResponse.ok) {
          history.push("/formsubmitted")
        } else {
          console.error("Failed to check response existence");
          // Handle failure to check response existence
        }

        // Fetch form data
        const formResponse = await fetch(`${baseURL}/getformdata/${form_id}`);
        const formData = await formResponse.json();
        if (formResponse.ok) {
          setFormdata(formData);
          setIsLoading(false);
        }
        // Set initial responses based on response type
        const initialResponses = {};
        const initialPercentages = formData.titles.map((topic) =>
          Array(topic.questions.length).fill(20)
        );

        formData.titles.forEach((topic, topicIndex) => {
          topic.questions.forEach((question, questionIndex) => {
            const questionKey = `question${topicIndex}-${questionIndex}`;
            initialResponses[questionKey] =
              question.ResponseType === "rating" ? 20 : "";
          });
        });

        setResponses(initialResponses);
        setPercentages(initialPercentages);
      } catch (error) {
        console.error("Error fetching form data:", error);
        setFormdata(null);
        setIsLoading(true);
      }
    };

    fetchData();
  }, [form_id, userid, teacherid, history, setAdminName, setAdminEmail, setIsAuthenticated]);

  const updatePercentage = (topicIndex, questionIndex, value) => {
    setPercentages((prevPercentages) => {
      const newPercentages = [...prevPercentages];
      newPercentages[topicIndex][questionIndex] = value;
      return newPercentages;
    });
    setResponses((prevResponses) => {
      const newResponses = { ...prevResponses };
      const questionKey = `question${topicIndex}-${questionIndex}`;
      newResponses[questionKey] = value;
      return newResponses;
    });
  };

  const updateTextResponse = (topicIndex, questionIndex, value) => {
    const questionKey = `question${topicIndex}-${questionIndex}`;
    setTextResponses((prevTextResponses) => ({
      ...prevTextResponses,
      [questionKey]: value,
    }));
  };

  const submitForm = async () => {
    try {
      // Check if form_id is present
      if (!form_id) {
        console.error("Missing form_id in the URL");
        return;
      }

      // Prepare data for the post request
      const ratingResponses = [];
      const textResponsesData = [];

      Object.keys(responses).forEach((questionKey) => {
        const [topicIndex, questionIndex] = questionKey
          .replace("question", "")
          .split("-");

        if (
          formdata.titles[topicIndex]?.questions[questionIndex]?.ResponseType ===
            "rating" &&
          responses[questionKey] !== ""
        ) {
          ratingResponses.push({
            form_id: form_id,
            question_id: formdata.titles[topicIndex].questions[questionIndex]
              .questions_id,
            user_id: userid || null,
            teacher_id: teacherid || null, // Add teacher_id to the request
            rating_response: responses[questionKey],
          });
        } else if (
          formdata.titles[topicIndex]?.questions[questionIndex]?.ResponseType ===
          "text"
        ) {
          textResponsesData.push({
            form_id: form_id,
            question_id: formdata.titles[topicIndex].questions[questionIndex]
              .questions_id,
            user_id: userid || null,
            teacher_id: teacherid || null, // Add teacher_id to the request
            text_response: textResponses[questionKey] || null,
          });
        }
      });

      // Make the post request for rating responses
      await fetch(`${baseURL}/setratingresponse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingResponses),
      });

      // Make the post request for text responses
      await fetch(`${baseURL}/settextresponse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(textResponsesData),
      });

      // Optionally, you can handle success or redirect to a success page
      history.push("/formsubmitted");

    } catch (error) {
      console.error("Error submitting form:", error);
      // Optionally, you can handle errors or redirect to an error page
    }
  };

  const handleDeleteForm = async () => {
    try {
      // Check if form_id is present
      if (!form_id) {
        console.error("Missing form_id in the URL");
        return;
      }
  
      const response = await fetch(`${baseURL}/deleteform`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ form_id })
      });
      
      if (response.ok) {
        // Form deleted successfully
        console.log("Form deleted successfully!");
        history.push(`/forms`);
      } else if (response.status === 401) {
        // Responses exist for the form, deletion not allowed
        console.error("Responses exist for this form. Deletion not allowed.");
      } else {
        // Handle other error cases
        console.error("Form deletion failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      // Optionally, you can handle errors or redirect to an error page
    }
  };
  
  const handleEditForm = () => {
    // Redirect to the edit form page
    history.push(`/editform/${form_id}`);
  };

  const renderEditDeleteButtons = () => {
    // Check if userid or teacherid is present in the URL
    if (userid || teacherid) {
      // If either userid or teacherid is present, do not render edit and delete buttons
      return <Formnav />;
    }
    // If neither userid nor teacherid is present, render edit and delete buttons
    return (
      <>
      <Topnav/>
      <div className="edit-delete-buttons">
        <button className="edit-btn" onClick={handleEditForm}>
          Edit
        </button>
        <button className="delete-btn" onClick={handleDeleteForm}>
          Delete
        </button>
      </div>
      </>
    );
  };

  return (
    <>
      {isLoading ? (
        <div className="FormPage">
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
        <div className={`FormPage ${darkmode ? 'dark-mode' : ''}`}>
          {renderEditDeleteButtons()}

          <div className="header">
            <h1>{formdata.formTitle}</h1>
          </div>

          <div className="FormContainer">
            {formdata === null ? (
              <div>NULL</div>
            ) : (
              formdata.titles.map((topic, topicIndex) => (
                <div
                  key={topic.title}
                  className="Topic"
                  style={{ marginLeft: "20px" }}
                >
                  <h1>{topic.title}</h1>
                  <div className="FormQuestions">
                    {topic.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="QuestionContainer">
                        <div className="TextItems">{question.question}</div>
                        {question.ResponseType === "rating" ? (
                          <div
                            className="ProgressBars"
                            id={`progress-${topicIndex}-${questionIndex}`}
                          >
                            <div className="bar-bg">
                              {[20, 40, 60, 80, 100].map((percentageValue) => (
                                <div
                                  key={percentageValue}
                                  className="bar-fill"
                                  id={`section${percentageValue}`}
                                  style={{
                                    backgroundColor:
                                      percentages[topicIndex][questionIndex] >=
                                      percentageValue
                                        ? "#053872"
                                        : "transparent",
                                  }}
                                  onClick={() =>
                                    updatePercentage(
                                      topicIndex,
                                      questionIndex,
                                      percentageValue
                                    )
                                  }
                                ></div>
                              ))}
                            </div>
                            <div className="Percentage">
                              <h3>{percentages[topicIndex][questionIndex]}%</h3>
                            </div>
                          </div>
                        ) : (
                          <div className="TextInputContainer">
                            <input
                              type="text"
                              placeholder="Type your answer here..."
                              className="CommentIpt"
                              onChange={(e) =>
                                updateTextResponse(
                                  topicIndex,
                                  questionIndex,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            <button className="submit-btn" onClick={submitForm}>
              SUBMIT
            </button>
          </div>
        </div>
      )}
    </>
  );
}
