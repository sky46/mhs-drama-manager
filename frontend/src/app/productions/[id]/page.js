'use client';
import { useParams } from "next/navigation";
import Qrcode from '../../components/qrcode'


export default function ProductionPage() {
    const { id } = useParams();

    return (
        <div>
            <h1>YOU ARE ON PRODUCTION PAGE {id}</h1>
            <Qrcode link="google.com"></Qrcode>
        </div>
    );
}
