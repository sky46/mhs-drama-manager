"use client"; 
import { useState, useEffect } from "react";
import Link from 'next/link';

import Production from "../components/production";

export default function Productions() {
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

        const fetchProductions = async () => {
            try {
                const res = await fetch('http://localhost:3001/productions', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
        
                if (!res.ok) {
                throw new Error('Failed to fetch productions');
                }
        
                const data = await res.json();
                setProductions(data.productions);
                setRole(data.role);
            } catch (error) {
                console.log(error.message);
            }
        }
        fetchProductions();

    }, []);
    

    return (
        <div>
            {isLoggedIn ? (
                <div>
                    <h1 className="text-3xl mb-5 mx-2">My productions</h1>
                    <div>
                        {productions.length === 0 ? (
                            <p>No productions found for this user.</p>
                        ) : (
                                productions.map((production) => (  
                                    <Production 
                                        key={production.id} 
                                        name={production.name} 
                                        id={production.id} 
                                        teachers={production.teachers}
                                        student={production.student} 
                                    />
                                ))
                        )}
                    </div>
                </div>
            ) : (
                <div>Please log in.</div>
            )}


        </div>
    );
}
