'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Select from 'react-select';

export default function EditProductionPage() {
    const {id} = useParams();

    const [domLoaded, setDomLoaded] = useState(false);
    const [name, setName] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachersOptions, setTeachersOptions] = useState([]);
    const [studentsOptions, setStudentsOptions] = useState([]);

    const router = useRouter();

    useEffect(() => {
        setDomLoaded(true);
        getCurrentProduction();
    }, []);

    const getCurrentProduction = async () => {
        const res = await fetch(`http://localhost:3001/productions/${id}/getEditData`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
              },
            credentials: 'include',
        });
        if (!res.ok) {
            throw new Error('Failed to fetch production data');
        }

        const data = await res.json();
        const productionData = data.production;
        setName(productionData.name);

        function usersToOptions(userRows) {
            return userRows.map((user) => ({value: user.id, label: user.name}));
        } 

        setTeachers(usersToOptions(productionData.currentTeachers));
        setStudents(usersToOptions(productionData.currentStudents));
        setTeachersOptions(usersToOptions(productionData.allTeachers));
        setStudentsOptions(usersToOptions(productionData.allStudents));
    }

    const saveProduction = async (e) => {
        e.preventDefault();
        const res = await fetch(`http://localhost:3001/productions/${id}/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
              },
            credentials: 'include',
            body: JSON.stringify({name: name, teachers: teachers, students: students}),
        });
        if (res.ok) {
            router.push(`/productions/${id}`);
        } else {
            throw new Error('Failed to save production');
        }
    }

    return (
        <div>
            <h1>Edit production</h1>
            {domLoaded && (
                <form onSubmit={saveProduction} className="flex flex-col">
                    <label htmlFor="name" className="font-bold">Production name</label>
                    <input type="text" id="name" value={name} onChange={(val) => setName(val.target.value)} />
                    <label htmlFor="teachers">Teachers</label>
                    <Select
                        isMulti
                        options={teachersOptions}
                        id="teachers"
                        value={teachers}
                        onChange={(val) => setTeachers(val)}
                        placeholder="Start typing to search..."
                    />
                    <label htmlFor="students">Students</label>
                    <Select
                        isMulti
                        options={studentsOptions}
                        id="students"
                        value={students}
                        onChange={(val) => setStudents(val)}
                        placeholder="Start typing to search..."
                    />
                    <button type="submit">Save</button>
                </form>
            )}
        </div>
    )
}