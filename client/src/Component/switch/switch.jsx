import { useState, useEffect } from "react";
import "./switch.css";

function ThemeSwitch() {
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");

        if (savedMode === null) {
            return true; // mặc định Dark
        }

        return savedMode === "true";
    });

    useEffect(() => {
        document.body.classList.toggle("light", !darkMode);

        localStorage.setItem("darkMode", String(darkMode));

    }, [darkMode]);

    return (
        <label className="switch">
            <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
            />
            <span className="switch-slider"></span>
        </label>
    );
}

export default ThemeSwitch;
