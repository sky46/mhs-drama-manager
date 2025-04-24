'use client';
import React from "react";
import { useRouter } from "next/navigation";


export default function Production({ name, teachers, student, id }) {
    const router = useRouter();
    
    return(
        <div>
            <div
                onClick={() => router.push(`/productions/${id}`)}
                className="bg-gray-100 w-1/3 p-3 m-3 hover:cursor-pointer hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-300"
            >
                <h2>{name}</h2>
                <p>Teachers: {teachers.map(teacher => teacher.name).join(', ')}</p> {/* Need to map first because object */}
                <p>Number of Students: {student}</p>
            </div>
        </div>
    );
}