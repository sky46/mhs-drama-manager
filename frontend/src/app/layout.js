import Link from 'next/link';

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
            </ul>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
