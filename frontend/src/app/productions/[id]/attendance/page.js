'use client';

import styles from '../../../styles/attendance.module.css'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; 

function ProdAttendancePage() {
    const {id} = useParams();

    const [attendance, setAttendance] = useState([]);
    const [dates, setDates] = useState([]);
    const [startDate, setStartDate] = useState(new Date());

    useEffect(() => {
        getProdAttendance();
        getDates(startDate);
    }, [startDate]);

    const getDates = (baseDate) => {
        var generatedDates = [];
        var currentDate = new Date(baseDate);
        currentDate.setUTCHours(0, 0, 0, 0);
        for (var i = 0; i < 7; i++) {
            generatedDates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
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
    };

    const nextWeek = () => {
        const newStartDate = new Date(startDate);
        newStartDate.setUTCDate(startDate.getUTCDate()+7);
        setStartDate(newStartDate);
    };

    const lastWeek = () => {
        const newStartDate = new Date(startDate);
        newStartDate.setUTCDate(startDate.getUTCDate()-7);
        setStartDate(newStartDate);
    };

    return (
        <div>
            <h1>Attendance</h1>
            <div className={styles.flex}>
                <button onClick={lastWeek}>Previous Week</button>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <td className={styles.td}></td>
                            {dates.map(date => (
                                <th key={date} scope="col" className={styles.th}>
                                    {new Date(date).toLocaleDateString('en-CA', {weekday: 'short', month: 'short', day: 'numeric'})}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.map(user => (
                            <tr key={user.user_id}>
                                <th scope="row" className={styles.th}>{user.name}</th>
                                {dates.map(date => (
                                    <td key={date} className={styles.td}>{user.attendedDates[date] === true ? (<span>Present</span>) : (<span>-</span>)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={nextWeek}>Next Week</button>
            </div>
        </div>
    );
}


export default ProdAttendancePage;
