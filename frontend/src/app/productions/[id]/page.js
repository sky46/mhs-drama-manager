'use client';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import Qrcode from '../../components/qrcode'
import Production from "../../components/production";

// based off page id, link qrcode to localhost:3000/productions/id/qrcode which will show check in button
// change to if not signed in, route to sign in and then back to this

export default function ProductionPage() {
    const { id } = useParams();
    const [production, setProduction] = useState(null);
    const [role, setRole] = useState("");
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [message, setMessage] = useState("");
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {
        fetchProduction();
        checkRole();
        getAllAttendance();
    }, []);

    const getAllAttendance = async() => { // attendance is 1 day behind, figure out why
        try {
            const response = await fetch(`http://localhost:3001/productions/${id}/attendance/all`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            setAttendance(data.attendance);
        } catch (error) {
            console.log("ERROR:", error);
        }
    }
    const fetchProduction = async () => {
        try {
            const res = await fetch(`http://localhost:3001/productions/${id}`, {
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
            setProduction(data.productionData);
        } catch (error) {
            console.log(error.message);
        }
    }
    const checkRole = async () => {
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

    if (!production) {
        return <div></div>;
    }
    const markAttendance = async () => {
        try {
            const response = await fetch(`http://localhost:3001/productions/${id}/markattended`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            if (response.status === 200) {
                setAttendanceMarked(data.tracked);
                setMessage("Attendance successfully logged!");
            } else if (response.status === 409) {
                setAttendanceMarked(true); 
                setMessage("Attendance already recorded for today.");
                console.log(attendanceMarked);
            }
            console.log("ATTENDANCE MARKED:", attendanceMarked);
        } catch (error) { 
            console.log("Error:", error)
        }
    }

    return (
        <div key={attendanceMarked}>
            {role==="teacher" ? (
                <div>
                    <Production 
                    key={production.id} 
                    name={production.name} 
                    id={production.id} 
                    teachers={production.teachers}
                    student={production.studentCount} 
                    />
                    <Qrcode link={`http://localhost:3000/productions/${id}`}></Qrcode>
                </div>
            ) : (
                <div>
                    {attendanceMarked ? (
                        <div>
                            <div>{message}</div>
                        </div>
                    ) : (
                        <div>
                            <button onClick={markAttendance}>Log attendance</button>
                        </div>
                    )}
                    <div>
                        <div>Days attended:</div>
                        <ul>
                            {attendance.length > 0 ? (
                                attendance.map((entry, index) => (
                                    <li key={index}>{new Date(entry.attendance_date).toLocaleDateString()}</li>
                                ))
                            ) : (
                                <p>No attendance records found.</p>
                            )}
                        </ul>

                    </div>
                </div>
            )}
        </div>
    );
}
