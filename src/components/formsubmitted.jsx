import React from 'react';
import "./formsubmitted.css"
import DonePic from "../images/check_mark.png"

export default function Formsubmitted() {
  return (
    <>
    <div className="SubmittedPage">
        <div className="submitContainer">
            <div className="imgContainer">
                <img src={DonePic} alt="Loading" />
            </div>
            <div className="DoneText">
                <h1>Thank you for Submitting Response!</h1>
            </div>
        </div>
    </div>
    </>
  )
}
