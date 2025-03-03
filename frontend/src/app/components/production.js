'use client';
import React from "react";
import { useRouter } from "next/navigation";
import styles from '../styles/production.module.css';


export default function Production({ name, teachers, student, id }) {
    const router = useRouter();
    
    return(
        <div className={styles.cards}>
            <div onClick={() => router.push(`/productions/${id}`)} className={styles.card}>
                <h2 className={styles.text}>{name}</h2>
                <p className={styles.text}>Teachers: {teachers.map(teacher => teacher.name).join(', ')}</p> {/* Need to map first because object */}
                <p className={styles.text}>Number of Students: {student}</p>
            </div>
        </div>
    );
}