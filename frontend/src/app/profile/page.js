"use client"; 
import { useState, useEffect } from "react";

import { useQRCode } from 'next-qrcode'; // https://www.npmjs.com/package/next-qrcode -> use SVG to be able to be printed out later on
import styles from '../styles/profile.module.css';

function Profile() {
    // Implement protected page
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState("");
    const { SVG } = useQRCode();

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
            {/*
            {isLoggedIn ? (
                <div>You are logged in</div>
            ) : (
                <div>Please log in.</div>
            )}
            <div>{role}</div>
            ^^ Commented out right now to just work on QR CODE */}

            <div>QR Code</div>
            <div className={styles.qrCodeAround}>
                <SVG
                    text={'https://google.com'} // Change to backend api call later
                    options={{
                        margin: 2,
                        width: 200,
                        color: {
                        dark: '#000000',
                        light: '#ffffff',
                        },
                    }}
                />
            </div>
        </div>
    );
}

export default Profile;