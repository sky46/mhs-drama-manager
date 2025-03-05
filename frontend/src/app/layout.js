"use client"; 
import { useState, useEffect } from "react";
import Link from 'next/link';
import Logout from './components/logout';
import styles from './styles/layout.module.css'


// change layout so that it doesn't have the login and sign up if already signed in

function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
  }, []);


  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <ul className={styles.list}>
              <li className={styles.listitem}><Link href="/calendar" className={styles.navitem}>Calendar</Link></li>
              <li className={styles.listitem}><Link href="/attendance" className={styles.navitem}>Attendance</Link></li>
              <li className={styles.listitem}><Link href="/profile" className={styles.navitem}>Profile</Link></li>
                {isLoggedIn ? (
                  <li className={styles.listitem}><Logout onLogout={checkLoginStatus} /></li>
                ) : (
                  <div>
                    <li className={styles.listitem}><Link href="/login" className={styles.navitem}>Login</Link></li>
                    <li className={styles.listitem}><Link href="/signup" className={styles.navitem}>Sign Up</Link></li>
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
