"use client"; 
import { useState, useEffect } from "react";

import styles from '../styles/profile.module.css';
import Qrcode from '../components/qrcode'


function Profile() {
    // Implement protected page
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState("");

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

        async function checkRole() {
            try {
                const response = await fetch("http://localhost:3001/users/role", {
                    credentials: "include",
                })
                const data = await response.json();
                setRole(data.role);
            } catch (error) {
                console.error("Error geting role:", error);
            }
        }
        checkRole();
    }, []);

    return (
        <div>
            <div>{role}</div>
            {isLoggedIn ? (
                <div>You are logged in</div>
            ) : (
                <div>Please log in.</div>
            )}

            <Qrcode link="google.com"></Qrcode>

        </div>
    );
}

export default Profile;