'use client';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Select from 'react-select';

export default function newProductionPage() {
    const [domLoaded, setDomLoaded] = useState(false);
    const [teachersOptions, setTeachersOptions] = useState([]);
    const [studentsOptions, setStudentsOptions] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [name, setName] = useState('');

    const router = useRouter();
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
        const res = await fetch(`http://localhost:3001/productions/new`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({name: name, teachers: teachers, students: students}),
        });
        const resData = await res.json();

        if (res.ok) {
            router.push(`/productions/${resData.productionId}`);
        } else {
            console.log("Creation failed: ", res.statusText);
            if (resData.exists) {
                alert("A production with this name already exists.");
            }
        }
    }
    useEffect(() => {
        setDomLoaded(true);
        getAvailableUsers();
    }, []);
    return (
        <div>
            {domLoaded && (
                <form onSubmit={createProduction}>
                    <input type="text" value={name} onChange={(val) => setName(val.target.value)} />
                    <Select isMulti options={teachersOptions} value={teachers} onChange={(val) => setTeachers(val)} />
                    <Select isMulti options={studentsOptions} value={students} onChange={(val) => setStudents(val)} />
                    <button type="submit">Create</button>
                </form>
            )}
        </div>
    )
}