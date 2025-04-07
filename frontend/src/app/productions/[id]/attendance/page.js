'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; 

function ProdAttendancePage() {
    const {id} = useParams();

    const [attendance, setAttendance] = useState([]);
    const [dates, setDates] = useState([]);

    useEffect(() => {
        getProdAttendance();
        getDates();
    }, []);

    const getDates = () => {
        var generatedDates = [];
        var currentDate = new Date();
        currentDate.setUTCHours(0,0,0,0);
        for (var i = 0; i < 7; i++) {
            generatedDates.unshift(currentDate.toISOString());
            currentDate.setDate(currentDate.getDate() - 1);
        }
        setDates(generatedDates);
        console.log(generatedDates);
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
        console.log(data.attendance[0].attendedDates);
    };

    return (
        <div>
            <h1>Attendance</h1>
            <table>
                <thead>
                    <tr>
                        <td></td>
                        {dates.map(date => (
                            <th key={date} scope="col">
                                {new Date(date).toLocaleDateString('en-CA', {weekday: 'short', month: 'short', day: 'numeric'})}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {attendance.map(user => (
                        <tr key={user.user_id}>
                            <th scope="row">{user.name}</th>
                            {dates.map(date => (
                                <td key={date}>{user.attendedDates[date] === true ? (<span>Present</span>) : (<span>-</span>)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


export default ProdAttendancePage;
