'use client';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import Qrcode from '../../components/qrcode'
import Production from "../../components/production";

// based off page id, link qrcode to localhost:3000/productions/id/qrcode which will show check in button

export default function ProductionPage() {
    const { id } = useParams();
    const [production, setProduction] = useState(null);
    useEffect(() => {
        fetchProduction();
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
    if (!production) {
        return <div></div>;
    }
    return (
        <div>
            <Production 
                key={production.id} 
                name={production.name} 
                id={production.id} 
                teachers={production.teachers}
                student={production.studentCount} 
            />
            <Qrcode link={`http://localhost:3000/productions/${id}/qrcode`}></Qrcode>
        </div>
    );
}
