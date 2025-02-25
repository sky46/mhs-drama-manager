import Link from 'next/link';
import Logout from './components/logout';

function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <ul style={{ }}>
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/signup">Sign Up</Link></li>
              <li><Link href="/calendar">Calendar</Link></li>
              <li><Link href="/attendance">Attendance</Link></li>
              <li><Link href="/profile">Profile</Link></li>
              <li><Logout></Logout></li>
            </ul>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
