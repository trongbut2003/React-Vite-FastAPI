import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ThemeSwitch from "../switch/switch";
import "./SideMenu.css";
import { useNavigation } from "../NavigationContext";

function SideMenu() {

    const [open, setOpen] = useState(false);

    const navigate = useNavigate();
    const { startNavigation } = useNavigation();


    // Chuyển trang
    const goToPage = (path) => {

        startNavigation(navigate, path);
        // Đóng menu sau khi chọn
        setOpen(false);
    };


    return (
        <div style={{ position: 'relative', zIndex: "1000"}}>

            {/* Nút 3 gạch */}
            <button
                className={`menu-button ${open ? "open" : ""}`}
                onClick={() => setOpen(!open)}
            >

                <span></span>
                <span></span>
                <span></span>

            </button>


            {/* Side Menu */}
            <div className={`side-menu ${open ? "show" : ""}`}>

                <button
                    className="menu-item"
                    onClick={() => goToPage("/")}
                >
                    <img className="white-img" src="/img/home-icon.png" width={"20px"} height={"20px"}/>
                    <span style={{marginLeft: "5px"}}></span>
                    Home
                </button>


                <button
                    className="menu-item"
                    onClick={() => goToPage("/chart")}
                >
                    <img className="white-img" src="/img/chart-icon.png" width={"20px"} height={"20px"}/>
                    <span style={{marginLeft: "5px"}}></span>
                    Charts
                </button>

                <button
                    className="menu-item"
                    onClick={() => goToPage("/report")}
                >
                    <img className="white-img" src="/img/report-icon.png" width={"20px"} height={"20px"}/>
                    <span style={{marginLeft: "5px"}}></span>
                    Reports
                </button>

                <button
                    className="menu-item"
                    onClick={() => goToPage("/dashboard")}
                >
                    <img className="white-img" src="/img/web-icon.png" width={"20px"} height={"20px"}/>
                    <span style={{marginLeft: "5px"}}></span>
                    TestWeb
                </button>

                <button
                    className="menu-item"
                    onClick={() => window.pywebview.api.close_app()}
                >
                    <span style={{marginLeft: "5px"}}></span>
                    Exit
                </button>


                <div style={{ margin: "10px 10px 0 30px", display: "flex", flexDirection: "row"}}>
                    <div style={{transform: "translateX(-10px) translateY(-2px)", color: "white"}}> Dark Mode </div>
                    <ThemeSwitch></ThemeSwitch>
                </div>



            </div>


            {/* Overlay */}
            {open && (
                <div
                    className="menu-overlay"
                    onClick={() => setOpen(false)}
                />
            )}

        </div>
    );
}

export default SideMenu;