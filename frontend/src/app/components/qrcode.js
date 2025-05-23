'use client';
import React from "react";
import { useQRCode } from 'next-qrcode'; // https://www.npmjs.com/package/next-qrcode
    // https://medium.com/stackanatomy/svg-vs-canvas-a-comparison-1b58e6c84326 -> use SVG to be able to be printed out later on

export default function Qrcode({ link }) {
    const { SVG } = useQRCode();
    
    return(
        <div>
            <div>
                <SVG
                    text={link}
                    options={{
                        margin: 2,
                        width: 300,
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