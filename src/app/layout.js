import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import LeftSidebar from '../components/LeftSidebar';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <div className="flex h-screen bg-gray-100">
          <LeftSidebar />
          {children}
        </div>
      </body>
    </html>
  );
}