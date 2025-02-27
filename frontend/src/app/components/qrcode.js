'use client';
import React from "react";
import { useQRCode } from 'next-qrcode'; // https://www.npmjs.com/package/next-qrcode -> use SVG to be able to be printed out later on

export default function Qrcode({ link }) {
    const { SVG } = useQRCode();
    
    return(
        <div>
            <div>QR Code</div>
            <div>
                <SVG
                    text={link} // Change to backend api call later
                    options={{
                        margin: 2,
                        width: 200,
                        color: {
                        dark: '#000000',
                        light: '#ffffff',
                        },
                    }}
                />
            </div>
        </div>
    );
}