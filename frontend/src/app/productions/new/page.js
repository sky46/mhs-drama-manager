'use client';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Select from 'react-select';

export default function newProductionPage() {
    const [teachersOptions, setTeachersOptions] = useState([]);
    const [studentsOptions, setStudentsOptions] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
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
                <Select options={teachersOptions} />
                <Select isMulti options={studentsOptions} name="students" value={students} />
                <button type="submit">Create</button>
            </form>
        </div>
    )
}