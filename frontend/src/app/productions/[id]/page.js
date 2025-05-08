'use client';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Select from 'react-select';
import Link from 'next/link';


import Qrcode from '../../components/qrcode'

import { useRouter } from 'next/navigation'

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

    const printQR = async () => {
        // code to print specific part of webpage -> https://stackoverflow.com/questions/12997123/print-specific-part-of-webpage
        var prtContent = document.getElementById("qr");
        var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        WinPrint.document.write(prtContent.innerHTML);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    }

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
            <div className="bg-primary-100 w-5/6 md:w-3/4 2xl:w-1/2 p-12 m-3 rounded-md flex flex-col lg:flex-row gap-8 lg:gap-20">
                <div>
                    <h1 className="text-3xl my-3">{production.name}</h1>
                    <p className="mb-1">
                        Teachers: {production.teachers.map((teacher, index) => (
                            <span key={teacher.id}>
                                {index > 0 && ", "}
                                <span className="text-accent-700 font-semibold">{teacher.name}</span>
                            </span>
                        ))}
                    </p> {/* Need to map first because object */}
                    <p><span className="text-accent-700 font-semibold">{production.studentCount}</span> student{production.studentCount !== 1 && 's'}</p>
                    {role === 0 && (
                        <div className="my-5">
                            <Link href={`/productions/${id}/edit`} className="inline-block me-2 hover:cursor-pointer py-2 px-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 active:ring-primary-300 active:ring-3">Edit</Link>
                            <button onClick={() => deleteProduction()} className="me-2 hover:cursor-pointer py-2 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 active:ring-red-300 active:ring-3">Delete</button>
                            <button onClick={() => printQR()} className="me-2 hover:cursor-pointer py-2 px-3 bg-accent-600 text-white rounded-md hover:bg-accent-700 active:ring-accent-300 active:ring-3">
                                Print QR code
                            </button>
                        </div>
                    )}
                </div>
                <div id='qr'><Qrcode link={`http://localhost:3000/productions/${id}`} className="qrprint"></Qrcode></div>
            </div>
            <div className="bg-secondary-100 w-5/6 md:w-3/4 2xl:w-1/2 p-12 m-3 rounded-md">
                <h2 className="text-2xl mb-3">Attendance</h2>
                {role===0 ? (
                    // Teacher view
                    <div className="flex flex-col">
                        <div className="flex gap-3">
                            <Link href={`/productions/${id}/attendance`} className="inline-block hover:cursor-pointer py-2 px-3 bg-primary-700 text-white rounded-md hover:bg-primary-800 active:ring-primary-300 active:ring-3">Attendance history</Link>
                            <button onClick={emailNonResponders} className="hover:cursor-pointer py-2 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 active:ring-red-300 active:ring-3">
                                Email missing students
                            </button>
                        </div>
                        <div className="flex gap-16 py-5">
                            <div>
                                <h3 className="text-lg">Present</h3>
                                {presentStudents.length > 0 ? (
                                    <ul className="list-disc list-inside">
                                        {presentStudents.map((entry, index) => (
                                            <li key={index}>{entry.label}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No present students.</p>
                                )}
                                
                            </div>
                            <div>
                                <h3 className="text-lg">Missing</h3>
                                {absentStudents.length > 0 ? (
                                    <ul className="list-disc list-inside">
                                        {absentStudents.map((entry, index) => (
                                            <li key={index}>{entry.label}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No absent students.</p>
                                )}
                            </div>
                        </div>
                        <form onSubmit={markStudentsAttendance}>
                            <h3 className="text-lg">Mark attendance</h3>
                            <Select
                                isMulti
                                options={absentStudents}
                                value={markPresentStudents}
                                onChange={(val) => setMarkPresentStudents(val)}
                                placeholder="Start typing to search..."
                                className="mb-2"
                            />
                            <button type="submit" className="hover:cursor-pointer py-2 px-3 bg-accent-600 text-white rounded-md hover:bg-accent-700 active:ring-accent-300 active:ring-3">Mark as present</button>
                        </form>
                    </div>
                ) : (
                    // Student view
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-20"> 
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
        </div>
    );
}
