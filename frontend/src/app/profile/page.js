"use client"; 
import { useState, useEffect } from "react";

function Profile() {
    // Implement protected page
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        async function checkLoginStatus() {
            try {
                const response = await fetch("http://localhost:3001/users/status", {
                    credentials: "include", // Ensures cookies are sent with the request
                });
                const data = await response.json();
                setIsLoggedIn(data.loggedIn);
            } catch (error) {
                console.error("Error checking login status:", error);
            }
        }

        checkLoginStatus();
    }, []);

    return (
        <div>
            {isLoggedIn ? (
                <div>You are logged in</div>
            ) : (
                <div>Please log in.</div>
            )}
        </div>
    );
}

export default Profile;