"use client"; 
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Logout from './components/logout';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const pathname = usePathname();

  async function checkLoginStatus() {
    try {
        const response = await fetch("http://localhost:3001/users/status", {
            credentials: "include", // Ensures cookies are sent with the request
        });
        const data = await response.json();
        setIsLoggedIn(data.loggedIn);
        setUserName(data.user.name);
    } catch (error) {
        console.error("Error checking login status:", error);
    }
  }

  useEffect(() => {
    checkLoginStatus(); 
  }, [pathname]);


  return (
    <html lang="en" className={inter.className}>
      <head>
        <title>Dratt!</title>
      </head>
      <body>
        <header>
          <nav className="backdrop-filter backdrop-blur bg-primary-900/85 text-white fixed top-0 left-0 right-0 flex py-3 px-5">
            <ul className="flex gap-8 items-center">
              <li><Link href="/" className="font-semibold text-lg">Dratt!</Link></li>
              <li><Link href="/productions" className="text-md">Productions</Link></li>
            </ul>
            <div className="ml-auto">
              {isLoggedIn ? (
                <div className="flex gap-8 items-center">
                  <span className="text-primary-100">Logged in as <span className="text-accent-100">{userName}</span></span>
                  <Logout onLogout={checkLoginStatus} />
                </div>
              ) : (
                <div className="flex gap-8 items-center">
                  <Link href="/login" className="text-md">Login</Link>
                  <Link href="/signup" className="text-md">Sign Up</Link>
                </div>
              )}
            </div>
          </nav>
        </header>
        <main className="pt-16 px-5">
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
