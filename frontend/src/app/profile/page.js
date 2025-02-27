"use client"; 
import { useState, useEffect } from "react";

import styles from '../styles/profile.module.css';
import Qrcode from '../components/qrcode'


function Profile() {
    // Implement protected page
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState("");
    const [productions, setProductions] = useState([]);

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

        const fetchProductions = async () => {
            try {
                const userId = 10; // get actual userId later on
                const res = await fetch(`http://localhost:3001/productions/${userId}`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                });
        
                if (!res.ok) {
                throw new Error('Failed to fetch productions');
                }
        
                const data = await res.json();
                setProductions(data);
            } catch (error) {
                console.log(error.message);
            }
        }
        fetchProductions();

    }, []);
    

    return (
        <div>
            <div>{role}</div>
            {isLoggedIn ? (
                <div>
                    <div>You are logged in</div>
                    <div>
                        {productions.length === 0 ? (
                            <p>No productions found for this user.</p>
                        ) : (
                            <ul>
                                {productions.map((production) => (  
                                    <li key={production.id}>{production.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            ) : (
                <div>Please log in.</div>
            )}

            <Qrcode link="google.com"></Qrcode>

        </div>
    );
}

export default Profile;