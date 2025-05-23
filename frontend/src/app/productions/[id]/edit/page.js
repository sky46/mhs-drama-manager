'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Select from 'react-select';

/**
 * @fileoverview Page to edit a production's name, teachers, and students.
 * Fetches current production data and displays it to be updated via forms.
 */

/**
 * Page component for displaying a page to edit an individual production.
 * 
 * @returns {JSX.Element} The edit production page.
 */
export default function EditProductionPage() {
    const {id} = useParams();

    const [domLoaded, setDomLoaded] = useState(false);
    const [name, setName] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachersOptions, setTeachersOptions] = useState([]);
    const [studentsOptions, setStudentsOptions] = useState([]);

    const router = useRouter();

    // On mount -> make page appear and get the data
    useEffect(() => {
        setDomLoaded(true);
        getCurrentProduction();
    }, []);

    /**
     * Fetches current production data (i.e. name, studnets, teachers) and sets corresponding state values in form.
     */
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

        // Converts users to list of objects that are select-compatible options
        function usersToOptions(userRows) {
            return userRows.map((user) => ({value: user.id, label: user.name}));
        } 

        setTeachers(usersToOptions(productionData.currentTeachers));
        setStudents(usersToOptions(productionData.currentStudents));
        setTeachersOptions(usersToOptions(productionData.allTeachers));
        setStudentsOptions(usersToOptions(productionData.allStudents));
    }

    /**
     * Updates backend with production data and redirects to the specific production view page.
     * 
     * @param {Event} e - Form submission event.
     */
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
        <div className="flex justify-center sm:justify-start">
            <div className="w-11/12 sm:w-3/4 lg:w-1/2 bg-primary-100 py-8 lg:py-12 px-4 md:px-8 lg:px-12 rounded-md">
                <h1 className="text-3xl mb-6">Edit production</h1>
                {domLoaded && (
                    <form onSubmit={saveProduction} className="flex flex-col gap-3">
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
                            <Link href={`/productions/${id}`} className="inline-block py-2 px-3 me-2 bg-red-600 text-white rounded-md hover:bg-red-700 active:ring-red-300 active:ring-3">Cancel</Link>
                            <button type="submit" className="hover:cursor-pointer py-2 px-3 me-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 active:ring-accent-300 active:ring-3">Save</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}