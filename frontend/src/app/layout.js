"use client"; 
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Logout from './components/logout';

import './globals.css';

// Font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

/**
 * @fileoverview Exports a root layout component that wraps all pages.
 */

/**
 * Root layout component that wraps all pages.
 * Handles nav bar and auth status.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nested page content (i.e. other pages).
 * @returns {JSX.Element} The layout page and anything nested inside it.
 */
function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const pathname = usePathname();

  /**
   * Checks user login status and updates logged in state (to update UI).
   */
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

  // Check if logged in every time route (pathname) changes -> otherwise, it won't show as updated unless you manually refresh
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
          <nav className="backdrop-filter backdrop-blur bg-primary-900/85 text-white fixed top-0 left-0 right-0 flex py-3 px-5 items-center">
            <ul className="flex gap-5 sm:gap-8 items-center">
              <li><Link href="/" className="font-semibold text-lg hover:text-accent-50 focus-visible:text-accent-50 active:text-accent-100">Dratt!</Link></li>
              {isLoggedIn && (
                <li><Link href="/productions" className="text-md hover:text-primary-100 focus-visible:text-primary-100 active:text-primary-200">Productions</Link></li>
              )}
              {isLoggedIn && userData.role === 0 && (
                <li><Link href="/productions/new" className="text-md hover:text-primary-100 focus-visible:text-primary-100 active:text-primary-200">New<span className="hidden sm:inline"> production</span></Link></li>
              )}
            </ul>
            <div className="ml-auto">
              {isLoggedIn ? (
                <div className="flex gap-5 sm:gap-8 items-center">
                  <span className="text-primary-200 hidden sm:inline-block">Logged in as <span className="text-accent-100 font-semibold">{userData.name}</span></span>
                  <Logout onLogout={checkLoginStatus} />
                </div>
              ) : (
                <div className="flex gap-5 sm:gap-8 items-center">
                  <Link href="/login" className="text-md hover:text-primary-100 focus-visible:text-primary-100 active:text-primary-200">Log in</Link>
                  <Link href="/signup" className="text-md hover:text-primary-100 focus-visible:text-primary-100 active:text-primary-200">Sign up</Link>
                </div>
              )}
            </div>
          </nav>
        </header>
        <main className="pt-20 px-2 sm:px-8">
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
