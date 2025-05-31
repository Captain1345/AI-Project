import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import LeftSidebar from '../components/LeftSidebar';
import { UserButton } from "@clerk/nextjs";

export const metadata = {
  title: "Your App Title",
  description: "Your app description",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
          <SignedIn>
            {/* UserButton in top-right */}
            <div style={{
              position: "fixed",
              top: 16,
              right: 24,
              zIndex: 50
            }}>
              <UserButton signOutUrl="/sign-in" />
            </div>
            <div className="flex h-screen bg-gray-100">
              <LeftSidebar />
              {children}
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center justify-center h-screen bg-gray-100">
              <SignIn routing="hash" />
            </div>
          </SignedOut>
        </body>
      </html>
    </ClerkProvider>
  );
}