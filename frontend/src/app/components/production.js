'use client';
import React from "react";
import { useRouter } from "next/navigation";


export default function Production({ name, teachers, student, id }) {
    const router = useRouter();
    
    return(
        <div>
            <div onClick={() => router.push(`/productions/${id}`)}>
                <h2>{name}</h2>
                <p>Teachers: {teachers.map(teacher => teacher.name).join(', ')}</p> {/* Need to map first because object */}
                <p>Number of Students: {student}</p>
            </div>
        </div>
    );
}