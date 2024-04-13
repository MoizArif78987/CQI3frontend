import React, { useState } from "react";
import { ReactComponent as Sun } from "./Sun.svg";
import { ReactComponent as Moon } from "./Moon.svg";
import "./DarkMode.css";

const DarkMode = ({ darkMode, onDarkModeToggle }) => {
    // Set the initial state of the checkbox based on the darkMode prop
    const [isChecked, setIsChecked] = useState(darkMode);

    // Handle the change event of the checkbox
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        onDarkModeToggle();
    };

    return (
        <div className='dark_mode'>
            <input
                className='dark_mode_input'
                type='checkbox'
                id='darkmode-toggle'
                checked={isChecked} // Set the checked state based on isChecked state
                onChange={handleCheckboxChange} // Handle checkbox change event
            />
            <label className='dark_mode_label' htmlFor='darkmode-toggle'>
                <Sun />
                <Moon />
            </label>
        </div>
    );
};

export default DarkMode;
