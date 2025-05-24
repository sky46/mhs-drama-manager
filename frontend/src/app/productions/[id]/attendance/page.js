'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; 
import Link from 'next/link';


function ProdAttendancePage() {
    const {id} = useParams();

    const [attendance, setAttendance] = useState([]);
    const [dates, setDates] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [searchStudent, setSearchStudent] = useState('');
    const [productionName, setProductionName] = useState('');

    useEffect(() => {
        setInitialStartDate();
    }, [])

    useEffect(() => {
        getProdAttendance();
        getDates(startDate);
    }, [startDate]);
    
    // https://stackoverflow.com/questions/57466655/how-to-generate-each-week-list-from-date-range-start-date-and-end-date
    // Used to generate list of dates in a week.
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
    
    // https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday?noredirect=1&lq=1
    // Adapted to get most recent Sunday including today.
    const setInitialStartDate = () => {
        var previousSunday = new Date();
        previousSunday.setDate(previousSunday.getDate() - (previousSunday.getDay() % 7));
        setStartDate(previousSunday);
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
        setProductionName(data.production.name);
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
            <h1 className="text-3xl mb-2">Attendance history for <span className="text-primary-800">{productionName}</span></h1>
            <Link href={`/productions/${id}`} className="inline-block mb-8 py-2 px-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 active:ring-primary-300 active:ring-3">Back to production</Link>
            <div className="flex flex-col gap-6">
                <div>
                    <table className="border-collapse text-center">
                        <thead>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2"></td>
                                {dates.map(date => (
                                    <th key={date} scope="col" className="border border-gray-400 px-4 py-2 font-semibold">
                                        {date.toLocaleDateString('en-CA', {weekday: 'short', month: 'short', day: 'numeric'})}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map(user => (
                                <tr key={user.user_id}>
                                    <th scope="row" className="border border-gray-400 px-4 py-2 font-semibold text-accent-700">{user.name}</th>
                                    {dates.map(date => (
                                        <td key={date} className="border border-gray-400 px-4 py-2">
                                            {
                                            user.attendedDates[date.toLocaleDateString('en-CA')] === true ? (<span>Present</span>) : (<span>-</span>)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="py-3">
                        <button onClick={lastWeek} className="hover:cursor-pointer py-2 px-3 me-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 active:ring-secondary-300 active:ring-3">Previous Week</button>
                        <button onClick={nextWeek} className="hover:cursor-pointer py-2 px-3 me-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 active:ring-secondary-300 active:ring-3">Next Week</button>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl mb-3">Days attended by student</h2>
                    <div className="flex flex-col gap-3 w-full sm:w-3/4 md:w-1/2">
                        <div>
                            <label htmlFor="studentName" className="block">Student name</label>
                            <input
                                type="Text"
                                placeholder="Search for student..."
                                value={searchStudent}
                                onChange={(e) => setSearchStudent(e.target.value)}
                                id="studentName"
                                className="w-5/6 bg-white my-1 inline-block py-1.5 px-2 rounded-sm border border-gray-300 focus:ring-2 focus:ring-secondary-300 focus:outline-none"
                            />
                        </div>
                        {
                            filteredStudentsAttendance.map((student, index) => (
                                <div key={index} className="bg-secondary-100 p-4 rounded-md">
                                    <h3 className="text-lg mb-1 font-semibold text-accent-700">{student.name}</h3>
                                    <ul className="list-disc list-inside">
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
            </div>
        </div>
    );
}


export default ProdAttendancePage;
