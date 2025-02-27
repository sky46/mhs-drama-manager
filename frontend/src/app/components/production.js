'use client';
import React from "react";
import { useRouter } from "next/navigation";
import styles from '../styles/production.module.css';


export default function Production({ name, teachers, id }) {
    const router = useRouter();
    
    return(
        <div onClick={() => router.push(`/productions/${id}`)} className={styles.card}>
            <h2>{name}</h2>
            <p>Teachers: {teachers.join(', ')}</p>
        </div>
    );
}