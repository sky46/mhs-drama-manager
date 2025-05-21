'use client';
import React from "react";
import { useRouter } from "next/navigation";


export default function Production({ name, teachers, student, id }) {
    const router = useRouter();
    
    return(
        <div>
            <div
                onClick={() => router.push(`/productions/${id}`)}
                className="bg-primary-100 w-5/6 sm:w-3/4 lg:w-1/2 p-5 m-3 hover:cursor-pointer rounded-md hover:bg-primary-200 focus:bg-primary-200 active:ring-3 active:ring-primary-400"
            >
                <h2 className="text-2xl mb-1">{name}</h2>
                <p>Teachers: {teachers.map(teacher => teacher.name).join(', ')}</p> {/* Need to map first because object */}
                <p>Number of students: {student}</p>
            </div>
        </div>
    );
}