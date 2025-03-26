'use client';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Select from 'react-select';

import Qrcode from '../../components/qrcode'
import Production from "../../components/production";

import { useRouter } from 'next/navigation'

// based off page id, link qrcode to localhost:3000/productions/id/qrcode which will show check in button
// change to if not signed in, route to sign in and then back to this

export default function ProductionPage() {
    const router = useRouter()
    
    const { id } = useParams();
    const [production, setProduction] = useState(null);
    const [role, setRole] = useState("");
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [message, setMessage] = useState("");
    const [attendance, setAttendance] = useState([]);
    const [nonresponders, setNonresponders] = useState([]);

    const [markPresentStudents, setMarkPresentStudents] = useState([]);
    const [absentStudents, setAbsentStudents] = useState([]);
    const [presentStudents, setPresentStudents] = useState([]);

    const [domLoaded, setDomLoaded] = useState(false);

    useEffect(() => {
        setDomLoaded();
        fetchProduction();
        checkRole();
        getAllAttendance();
        getNonResponders();
    }, [id]);

    // need to fix
    const getAllAttendance = async() => { // attendance is 1 day behind, figure out why
        try {
            const response = await fetch(`http://localhost:3001/productions/${id}/attendance/all`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            setAttendance(data.attendance);
            console.log("ATTENDANCE THING", attendance);
        } catch (error) {
            console.log("ERROR:", error);
        }
    }

    const getNonResponders = async() => {
        try {
            const response = await fetch(`http://localhost:3001/productions/${id}/attendance/noresponse`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();
            const mapper = (user) => ({ value: user.id, name: user.name, email: user.email });
            setNonresponders(data.map(mapper));
            console.log("Nonresponders", data.map(mapper));
        } catch (error) {
            console.log("Error:", error);
        }
    }

    const emailNonResponders = async() => {
        try {  
            const emailList = nonresponders.map(user => user.email);
            const response = await fetch(`http://localhost:3001/productions/${id}/attendance/reminder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ emailList }),
            });
            const data = await response.json();
            console.log("Sent email", data);
        } catch (error) {
            console.log("Error:", error);
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
            const attendance = data.productionData.attendance;
            const mapStudentsSelectOptions = (user) => ({value: user.id, label: user.name});
            setPresentStudents(attendance.present.map(mapStudentsSelectOptions));
            setAbsentStudents(attendance.absent.map(mapStudentsSelectOptions));
            console.log(data);
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
    const markSelfAttendance = async () => {
        try {
            const response = await fetch(`http://localhost:3001/productions/${id}/markselfattended`, {
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

    const markStudentsAttendance = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3001/productions/${id}/markstudentsattended`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({students: markPresentStudents})
            });
            if (response.ok) {
                alert('Attendance marked successfully!');
                const data = await response.json();
                const mapStudentsSelectOptions = (user) => ({value: user.id, label: user.name});
                setPresentStudents(data.newAttendance.present.map(mapStudentsSelectOptions));
                setAbsentStudents(data.newAttendance.absent.map(mapStudentsSelectOptions));
                setMarkPresentStudents([]);
                router.refresh();
            }
        } catch (error) {
            console.error("Error marking students attendance:", error);
        }
    }

    return (
        <div key={attendanceMarked}>
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
            {role==="teacher" && nonresponders.length > 0 ? (
                <div>
                    <form onSubmit={markStudentsAttendance}>
                        <Select isMulti options={absentStudents} value={markPresentStudents} onChange={(val) => setMarkPresentStudents(val)} />
                        <button type="submit">Mark as present</button>
                    </form>
                    <div>Students who haven't responded:</div>
                    <ul>
                        {nonresponders.map((entry, index) => (
                            <li key={index}>{entry.name}</li>
                        ))}
                    </ul>
                    <button onClick={emailNonResponders}>
                        EMAIL NONRESPONDERS
                    </button>
                </div>
            ) : (
                <div>
                    {attendanceMarked ? (
                        <div>
                            <div>{message}</div>
                        </div>
                    ) : (
                        <div>
                            <button onClick={markSelfAttendance}>Log attendance</button>
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
