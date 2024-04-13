import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import BeatLoader from "react-spinners/BeatLoader";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import Topnav from "./topnav";
import Sidenav from "./sidenav";
import "./adminpanel.css";
import { Bar, Pie } from "react-chartjs-2";
import { useAdminContext } from "../context/AdminContext";
import useRequireAuth from "../hooks/useRequireAuth";
import _ from "lodash";
const baseURL = process.env.REACT_APP_BASE_URL;

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Adminpanel() {
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

  const [forms, setForms] = useState([]);
  const [barChartData, setBarChartData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const responsePie = await fetch(`${baseURL}/getpiechartData`);
        const responseBar = await fetch(`${baseURL}/getbarchartData`);

        if (!responsePie.ok || !responseBar.ok) {
          throw new Error("Failed to fetch data");
        }

        const responseDataPie = await responsePie.json();
        const responseDataBar = await responseBar.json();

        setForms(responseDataPie);
        setBarChartData(responseDataBar);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const generatePieData = (form) => {
    let data;
    if (form.positiveCount === 0 && form.negativeCount === 0) {
      data = {
        labels: ["No responses yet"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["gray"],
          },
        ],
      };
    } else {
      data = {
        labels: ["Positive", "Negative"],
        datasets: [
          {
            data: [form.positiveCount, form.negativeCount],
            backgroundColor: ["#053872", "red"],
          },
        ],
      };
    }
    return data;
  };

  const generateBarData = (semesterData) => {
    const labels = [];
    const data = [];

    for (const semester in semesterData) {
      const semesterSubject = semesterData[semester];
      const percentageReserved =
        ((semesterSubject.Seats - semesterSubject.available_seats) /
          semesterSubject.Seats) *
        100;

      labels.push(semesterSubject.SubjectName);
      data.push(percentageReserved.toFixed(2)); // Round to 2 decimal places
    }

    return {
      labels: labels,
      datasets: [
        {
          label: "Percentage of Reserved Seats",
          data: data,
          backgroundColor: "#053872",
        },
      ],
    };
  };

  const pieOptions = {};
  const barOptions = {};

  return (
    <>
       <div className={`adminpanelPage ${darkmode ? 'dark-mode' : ''}`}>
        <Topnav />
        <div className="ContainerWithSideNav">
          <Sidenav active="Stats" />
          <div className="StatsPageContainer">
            <div className="surveygraphpanel">
              {isLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    marginLeft: "20px",
                  }}
                >
                  <BeatLoader
                    color="#053872"
                    size={10}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </div>
              ) : (
                forms.map((form) => (
                  <div className="graphCard" key={form.id}>
                    <div className="formname">
                      <p>{form.formTitle}</p>
                    </div>
                    <div className="graph">
                      <Pie data={generatePieData(form)} options={pieOptions} />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="RegisterationGraphPanel">
              {Object.keys(barChartData).map((semester) => (
                <div className="bargraph" key={semester}>
                  <h2>Semester {semester}</h2>
                  <Bar
                    data={generateBarData(barChartData[semester])}
                    options={barOptions}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
