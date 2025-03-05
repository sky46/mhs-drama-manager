'use client';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import Qrcode from '../../components/qrcode'
import Production from "../../components/production";


export default function ProductionPage() {
    const { id } = useParams();
    const [production, setProduction] = useState([]);
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
    fetchProduction();

    return (
        <div>
            <Production 
                key={production.id} 
                name={production.name} 
                id={production.id} 
                teachers={production.teachers}
                student={production.studentCount} 
            />
            <Qrcode link="google.com"></Qrcode>
        </div>
    );
}
