'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation'; 

function EditProductionPage() {
    const {id} = useParams();

    const [domLoaded, setDomLoaded] = useState(false);
    const [teachersOptions, setTeachersOptions] = useState([]);
    const [studentsOptions, setStudentsOptions] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [name, setName] = useState('');

    const router = useRouter();

    const getCurrentProduction = async () => {
        
    }

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