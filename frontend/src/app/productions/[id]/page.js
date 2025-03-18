'use client';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import Qrcode from '../../components/qrcode'
import Production from "../../components/production";

// based off page id, link qrcode to localhost:3000/productions/id/qrcode which will show check in button

export default function ProductionPage() {
    const { id } = useParams();
    const [production, setProduction] = useState(null);
    const [role, setRole] = useState("");

    useEffect(() => {
        fetchProduction();
        checkRole();
    }, []);
    const fetchProduction = async () => {
        try {
            const res = await fetch(`http://localhost:3001/productions/${id}`, {
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
            setProduction(data.productionData);
        } catch (error) {
            console.log(error.message);
        }
    }
    const checkRole = async () => {
        try {
            const response = await fetch("http://localhost:3001/users/role", {
                credentials: "include",
            })
            const data = await response.json();
            setRole(data.role);
        } catch (error) {
            console.error("Error geting role:", error);
        }
    }

    if (!production) {
        return <div></div>;
    }
    const logAttendance = async () => {
        // api call to log attendance
    }
    return (
        <div>
            {role==="teacher" ? (
                <div>
                    <Production 
                    key={production.id} 
                    name={production.name} 
                    id={production.id} 
                    teachers={production.teachers}
                    student={production.studentCount} 
                    />
                    <Qrcode link={`http://localhost:3000/productions/${id}`}></Qrcode>
                </div>
            ) : (
                <button onClick={logAttendance}>Log attendance</button>
            )}
        </div>
    );
}
