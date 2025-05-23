'use client';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Select from 'react-select';

/**
 * @fileoverview Page where a new production can be created.
 * Fetches available users and allows form submission to create a production and add users to it.
 */

/**
 * Page component for displaying production creation page. 
 * 
 * @returns {JSX.Element} The production creation page.
 */
export default function newProductionPage() {
    const [domLoaded, setDomLoaded] = useState(false);
    const [teachersOptions, setTeachersOptions] = useState([]);
    const [studentsOptions, setStudentsOptions] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [name, setName] = useState('');
    const router = useRouter();

    /**
     * Fetches available users for selection (updates state variables to set them as options).
     */
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

    /**
     * Handles the production creation form submission (redirects to the new production if successful).
     * @param {React.FormEvent} e - Form submission event.
     */
    const createProduction = async (e) => {
        e.preventDefault();
        // Only need to make sure it has a name -> it is fine if no students or teachers (can add later)
        if (name === "") {
            alert("You need to add a name for the production")
        } else {
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
    }

    // Run on mount to load available users and confirm DOM loaded
    useEffect(() => {
        setDomLoaded(true);
        getAvailableUsers();
    }, []);

    return (
        <div className="flex justify-center sm:justify-start">
            <div className="w-11/12 sm:w-3/4 lg:w-1/2 bg-primary-100 py-8 lg:py-12 px-4 md:px-8 lg:px-12 rounded-md">
                <h1 className="text-3xl mb-6">New production</h1>
                {domLoaded && (
                    <form onSubmit={createProduction} className="flex flex-col gap-3">
                        <div>
                            <label htmlFor="name" className="block">Production name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(val) => setName(val.target.value)}
                                className="w-full bg-white my-1 inline-block py-1.5 px-2 rounded-sm border border-gray-300 focus:ring-2 focus:ring-primary-300 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="teachers" className="block">Teachers</label>
                            <Select
                                isMulti
                                options={teachersOptions}
                                id="teachers"
                                value={teachers}
                                onChange={(val) => setTeachers(val)}
                                placeholder="Start typing to search..."
                            />
                        </div>
                        <div>
                            <label htmlFor="students" className="block">Students</label>
                            <Select
                                isMulti
                                options={studentsOptions}
                                id="students"
                                value={students}
                                onChange={(val) => setStudents(val)}
                                placeholder="Start typing to search..."
                            />
                        </div>
                        <div>
                            <button type="submit" className="hover:cursor-pointer py-2 px-3 bg-accent-600 text-white rounded-md hover:bg-accent-700 active:ring-accent-300 active:ring-3">Create</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}