"use client"; 
import { useState, useEffect } from "react";
import Production from "../components/production";

/**
 * @fileoverview Exports a page of all productions a user is a part of.
 * Checks login status before fetching and rendering the productions.
 */

/**
 * Page component to display the productions a user is part of.
 * 
 * @returns {JSX.Element} The page with all the productions the user is part of.
 */
export default function Productions() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState("");
    const [productions, setProductions] = useState([]);

    useEffect(() => {
         /**
         * Checks if the user is logged in.
         */
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

        /**
         * Fetches list of productions the user is a part of.
         */
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
                    <h1 className="text-3xl mb-5">My productions</h1>
                    <div>
                        {productions.length === 0 ? (
                            <p>Not currently a member of any productions.</p>
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
