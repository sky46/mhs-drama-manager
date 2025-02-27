'use client';
import React from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
    const router = useRouter();
    const logoutUser = async() => {
        fetch('http://localhost:3001/users/logout', {
            method: 'POST',
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Logout failed');
            }
            return response.json();
        })
        .catch(error => console.error(error));
        router.push("/");
    }

    return(
        <div>
            <button onClick={logoutUser}>Log out</button>
        </div>
    );
}