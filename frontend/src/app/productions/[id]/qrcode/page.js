'use client';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function LogAttendancePage() {
    const { id } = useParams();
    const logAttendance = async (e) => {
        e.preventDefault();
        // call backend function to log attendance
    }


    return (
        <div>
            <div>LOGGING ATTENDANCE PAGE</div>
            <button onClick={logAttendance}>Log your attendance!</button>
        </div>
    );
}