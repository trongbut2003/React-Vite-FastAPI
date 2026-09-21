import { useState } from "react";
import "./UserMenu.css";

function UserMenu() {
    const [open, setOpen] = useState(false);

    return (
        <div className="user-menu">

            {/* Avatar */}
            <button
                className="avatar-button"
                onClick={() => setOpen(!open)}
            >
            </button>

            {/* Dropdown */}
            {open && (
                <div className="user-dropdown">

                    <button className="user-menu-item">
                        Information
                    </button>

                    <button className="user-menu-item">
                        Change Password
                    </button>

                    <button className="user-menu-item logout">
                        Log Out
                    </button>

                    <div
                    className="menu-overlay"
                    onClick={() => setOpen(false)}
                    />

                </div>
                
            )}

        </div>
    );
}

export default UserMenu;