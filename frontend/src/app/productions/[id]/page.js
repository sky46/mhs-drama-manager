'use client';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Select from 'react-select';
import Link from 'next/link';

import Qrcode from '../../components/qrcode'

import { useRouter } from 'next/navigation'

// based off page id, link qrcode to localhost:3000/productions/id/qrcode which will show check in button
// change to if not signed in, route to sign in and then back to this

// also if scan qr code and not yet in, give option to join?

// route away after email? also it is in spam rn

export default function ProductionPage() {
    const router = useRouter()
    
    const { id } = useParams();
    const [production, setProduction] = useState(null);
    const [role, setRole] = useState(2);
    const [selfMarkedPresent, setSelfMarkedPresent] = useState(false);
    const [message, setMessage] = useState("");
    const [selfAttendanceHistory, setSelfAttendanceHistory] = useState([]);

    const [markPresentStudents, setMarkPresentStudents] = useState([]);
    const [absentStudents, setAbsentStudents] = useState([]);
    const [presentStudents, setPresentStudents] = useState([]);

    const [domLoaded, setDomLoaded] = useState(false);

    useEffect(() => {
        setDomLoaded();
        fetchProduction();
    }, [id]);

    const deleteProduction = async () => {
        try {
            const res = await fetch(`http://localhost:3001/productions/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({productionId: id}),
            });
            
            if (res.ok) {
                router.push(`/productions`);
            } else {
                console.log("Deletion failed:", res.details);
            }

        } catch (error) {
            console.log(error.message);
        }
    }


    const emailNonResponders = async() => {
        try {  
            const emailList = absentStudents.map(user => user.email);
            console.log("emails", emailList);
            const response = await fetch(`http://localhost:3001/productions/${id}/attendance/reminder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            console.log("PEOPLE", data.people);
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
            setRole(data.role);
            if (data.role === 0) {
                // Teacher
                const attendance = data.productionData.attendance;
                console.log("ATTENDANCE", attendance);
                const mapStudentsSelectOptions = (user) => ({value: user.id, label: user.name});
                setPresentStudents(attendance.present.map(mapStudentsSelectOptions));
                setAbsentStudents(attendance.absent.map(mapStudentsSelectOptions));
            } else {
                // Student
                setSelfAttendanceHistory(data.productionData.selfAttendanceHistory);
                setSelfMarkedPresent(data.productionData.selfMarkedPresent);
            }
        } catch (error) {
            console.log(error.message);
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
                setSelfMarkedPresent(true);
                setSelfAttendanceHistory(old => [...old, data.markedPresentRow]);
                setMessage("Attendance successfully logged!");
            } else if (response.status === 409) {
                setSelfMarkedPresent(true); 
            }
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
            }
        } catch (error) {
            console.error("Error marking students attendance:", error);
        }
    }

    return (
        <div key={selfMarkedPresent}>
            <div>
                <h1>{production.name}</h1>
                <p>Teachers: {production.teachers.map(teacher => teacher.name).join(', ')}</p> {/* Need to map first because object */}
                <p>Number of Students: {production.studentCount}</p>
                {role === 0 && (
                    <>
                        <Link href={`/productions/${id}/edit`}>Edit Production</Link>
                        <button onClick={() => deleteProduction()}>Delete Production</button>
                    </>
                )}
                <Qrcode link={`http://localhost:3000/productions/${id}`}></Qrcode>
            </div>
            {role===0 ? (
                // Teacher view
                <div>
                    <Qrcode link={`http://localhost:3000/productions/${id}`}></Qrcode>
                    <div>
                        <h2>Present</h2>
                        {presentStudents.length > 0 ? (
                            <ul>
                                {presentStudents.map((entry, index) => (
                                    <li key={index}>{entry.label}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No present students.</p>
                        )}
                        
                    </div>
                    <div>
                        <h2>Missing</h2>
                        {absentStudents.length > 0 ? (
                            <ul>
                                {absentStudents.map((entry, index) => (
                                    <li key={index}>{entry.label}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No absent students.</p>
                        )}
                    </div>
                    
                    <form onSubmit={markStudentsAttendance}>
                        <h2>Mark attendance</h2>
                        <Select isMulti options={absentStudents} value={markPresentStudents} onChange={(val) => setMarkPresentStudents(val)} />
                        <button type="submit">Mark as present</button>
                    </form>
                    <h2>Send email</h2>
                    <button onClick={emailNonResponders}>
                        EMAIL MISSING
                    </button>
                    <Link href={`/productions/${id}/attendance`}>Attendance history</Link>
                </div>
            ) : (
                // Student view
                <div>
                    {selfMarkedPresent ? (
                        <div>
                            <div>Marked as present.</div>
                        </div>
                    ) : (
                        <div>
                            <button onClick={markSelfAttendance}>Log attendance</button>
                        </div>
                    )}
                    <div>
                        <div>Days attended:</div>
                        <ul>
                            {selfAttendanceHistory.length > 0 ? (
                                selfAttendanceHistory.map((entry, index) => (
                                    <li key={index}>{
                                        new Date(new Date(entry.attendance_date)
                                        .setDate(new Date(entry.attendance_date)
                                        .getDate() + 1))
                                        .toLocaleDateString()
                                    }</li>
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
