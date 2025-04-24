"use client"; 
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from 'next/link';
import Logout from './components/logout';

import './globals.css';

function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  async function checkLoginStatus() {
    try {
        const response = await fetch("http://localhost:3001/users/status", {
            credentials: "include", // Ensures cookies are sent with the request
        });
        const data = await response.json();
        setIsLoggedIn(data.loggedIn);
    } catch (error) {
        console.error("Error checking login status:", error);
    }
  }

  useEffect(() => {
    checkLoginStatus(); 
  }, [pathname]);


  return (
    <html lang="en">
      <body className="mx-4">
        <header>
          <nav>
            <ul className="flex justify-between mt-4">
              <li><Link href="/productions" className="font-bold text-2xl">Productions</Link></li>
              {isLoggedIn ? (
                <li><Logout onLogout={checkLoginStatus} /></li>
              ) : (
                <div className="flex gap-2">
                  <li><Link href="/login" className="font-bold text-2xl">Login</Link></li>
                  <li><Link href="/signup" className="font-bold text-2xl">Sign Up</Link></li>
                </div>
              )}
            </ul>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
