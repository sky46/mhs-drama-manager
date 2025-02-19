'use client';
import React from "react";

export default function Logout() {

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
        .then(data => {
            console.log(data.message);
            window.location.reload();
        })
        .catch(error => console.error(error));
    }

    return(
        <div>
            <button onClick={logoutUser}>logout</button>
        </div>
    );
}