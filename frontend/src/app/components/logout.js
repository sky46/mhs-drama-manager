'use client';
import React from "react";
import { useRouter } from "next/navigation";

/**
 * @fileoverview Logout component that logs out the user and redirects to login page.
 * */

/**
 * Logout component.
 * 
 * @param {{ onLogout: () => void }} props - Callback to update app state after successful logout.
 * @returns {JSX.Element} A link that logs the user out when clicked.
 */
export default function Logout({ onLogout }) {
    const router = useRouter();

    // Sends logout request to backend and redirects if succesful
    const logoutUser = async () => {
        try {
            const response = await fetch('http://localhost:3001/users/logout', {
                method: 'POST',
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }
            onLogout(); // Updates state based on the login/out state of the person
            router.push("/login");
        } catch (error) {
            console.error("Logout Failed:", error);
        }
    };

    return (
        <a onClick={logoutUser} className="text-md hover:cursor-pointer">Log out</a>
    );
}