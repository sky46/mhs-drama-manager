'use client';

import { useParams } from 'next/navigation'; 

function ProdAttendancePage() {
    const {id} = useParams();

    const getProdAttendance = async () => {
        const res = await fetch(`http://localhost:3001/productions/${id}/attendance`)
    };

    return (
        <div></div>
    );
}


export default ProdAttendancePage;
