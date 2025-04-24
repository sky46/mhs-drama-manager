'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; 


function ProdAttendancePage() {
    const {id} = useParams();

    const [attendance, setAttendance] = useState([]);
    const [dates, setDates] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [searchStudent, setSearchStudent] = useState("");

    useEffect(() => {
        getProdAttendance();
        getDates(startDate);
    }, [startDate]);

    const getDates = (baseDate) => {
        // dates[] stores Date objects
        var generatedDates = [];
        var currentDate = new Date(baseDate);
        for (var i = 0; i < 7; i++) {
            generatedDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        setDates(generatedDates);
    }
    
    const getProdAttendance = async () => {
        const res = await fetch(`http://localhost:3001/productions/${id}/attendance`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!res.ok) { 
            throw new Error('Failed to get attendance');
        }
        
        const data = await res.json();
        setAttendance(data.attendance);
        console.log("Attendance", data.attendance);
    };

    const studentsAttendance = attendance.map(user => ({
        name: user.name,
        attendedDates: Object.entries(user.attendedDates)
            .filter(([date, present]) => present === true)
            .map(([date]) => date)
    }));

    const filteredStudentsAttendance = studentsAttendance.filter((item) => {
        return searchStudent 
        ? item.name.toLowerCase().includes(searchStudent.toLowerCase()) 
        : true;
    })
    

    const nextWeek = () => {
        const newStartDate = new Date(startDate);
        newStartDate.setDate(startDate.getDate()+7);
        setStartDate(newStartDate);
    };

    const lastWeek = () => {
        const newStartDate = new Date(startDate);
        newStartDate.setDate(startDate.getDate()-7);
        setStartDate(newStartDate);
    };

    return (
        <div>
            <h1>Attendance</h1>
            <div>
                <button onClick={lastWeek}>Previous Week</button>
                <table>
                    <thead>
                        <tr>
                            <td></td>
                            {dates.map(date => (
                                <th key={date} scope="col">
                                    {date.toLocaleDateString('en-CA', {weekday: 'short', month: 'short', day: 'numeric'})}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.map(user => (
                            <tr key={user.user_id}>
                                <th scope="row">{user.name}</th>
                                {dates.map(date => (
                                    <td key={date}>
                                        {
                                        user.attendedDates[date.toLocaleDateString('en-CA')] === true ? (<span>Present</span>) : (<span>-</span>)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={nextWeek}>Next Week</button>
            </div>
            <div>
                <h2>Students</h2>
                <input type="Text" placeholder="Search for student..." value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)}></input>
                {
                    filteredStudentsAttendance.map((student, index) => (
                        <div key={index}>
                            <h3>{student.name}</h3>
                            <ul>
                                {
                                Object.keys(student.attendedDates).length !== 0 
                                ? student.attendedDates.map((date, index) => (
                                    <li key={index}>{date}</li>
                                ))
                                : <li>No recorded attendance yet</li>
                                }
                            </ul>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}


export default ProdAttendancePage;
