'use client';
import React from "react";
import { useRouter } from "next/navigation";

export default function Logout({ onLogout }) {
    const router = useRouter();
    const logoutUser = async () => {
        try {
            const response = await fetch('http://localhost:3001/users/logout', {
                method: 'POST',
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }
            onLogout();
            router.push("/");
        } catch (error) {
            console.error("Logout Failed:", error);
        }
    };

    return (
        <div>
            <button onClick={logoutUser}>Log out</button>
        </div>
    );
}