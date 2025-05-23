'use client';
// https://stackoverflow.com/questions/74965849/youre-importing-a-component-that-needs-usestate-it-only-works-in-a-client-comp -> used this link to figure out how to change the page from server to client component in order to use useState

import { useState, useEffect } from "react";
import Link from 'next/link';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});

  async function checkLoginStatus() {
    try {
        const response = await fetch("http://localhost:3001/users/status", {
            credentials: "include", // Ensures cookies are sent with the request
        });
        const data = await response.json();
        setIsLoggedIn(data.loggedIn);
        if (data.loggedIn === true) {
          setUserData(data.user);
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
  }

  useEffect(() => {
    checkLoginStatus(); 
  }, []);

  return (
    <div>
      <main>
        <div className="bg-primary-100 py-10 lg:py-16 px-8 sm:px-12 rounded-md flex flex-col gap-8">
          <h1 className="text-6xl">Dratt!</h1>
          <h2 className="text-2xl">Drama attendance, simplified.</h2>
          {isLoggedIn ? (
            <div className="flex gap-2 flex-wrap">
              <Link href="/productions" className="inline-block hover:cursor-pointer py-2 px-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 active:ring-primary-300 active:ring-3">My productions</Link>
              {userData.role === 0 && (
                <Link href="/new" className="inline-block hover:cursor-pointer py-2 px-3 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 active:ring-secondary-300 active:ring-3">New production</Link>
              )}
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <Link href="/login" className="inline-block hover:cursor-pointer py-2 px-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 active:ring-primary-300 active:ring-3">Log in</Link>
              <Link href="/signup" className="inline-block hover:cursor-pointer py-2 px-3 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 active:ring-secondary-300 active:ring-3">Sign up as student</Link>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}
