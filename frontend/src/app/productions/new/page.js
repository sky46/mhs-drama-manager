'use client';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function newProductionPage() {
    const createProduction = async (e) => {
        e.preventDefault();
        // Api call localhost:3001/productions/new
    }
    return (
        <div>
            <form onSubmit={createProduction}>
                <input type="text">Name</input>
                {/* https://react-select.com for selecting teachers and students */}
                <button type="submit">Create</button>
            </form>
        </div>
    )
}