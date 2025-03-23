'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";

export default function newProductionPage() {
    const [teachersOptions, setTeachersOptions] = useState([]);
    const [studentsOptions, setStudentsOptions] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const Select = dynamic(() => import('react-select'), {
        loading: () => <input />,
        ssr: false
    });
    const getAvailableUsers = async () => {
        try {
            const res = await fetch(`http://localhost:3001/productions/new/availableusers`, {
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
            setTeachersOptions(data.teachers.map((teacher) => ({value: teacher.id, label: teacher.name})));
            setStudentsOptions(data.students.map((student) => ({value: student.id, label: student.name})));
        } catch (error) {
            console.log(error.message);
        }
    }
    const createProduction = async (e) => {
        e.preventDefault();
        // Api call localhost:3001/productions/new
    }
    useEffect(() => {
        getAvailableUsers();
    }, []);
    return (
        <div>
            <form onSubmit={createProduction}>
                <input type="text" />
                <Select isMulti options={teachersOptions} value={teachers} onChange={(value) => setTeachers(value)} />
                <Select isMulti options={studentsOptions} value={students} onChange={(value) => setStudents(value)} />
                <button type="submit">Create</button>
            </form>
        </div>
    )
}