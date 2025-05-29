import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Toaster } from 'sonner';
import "./globals.css";
import { useUser } from "@clerk/nextjs";
import UserInfo from './components/UserInfo';
import AdminLink from './components/AdminLink';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Certificate Verification System",
  description: "Verify your certificates securely",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <ClerkProvider>
          <header className="flex justify-between items-center p-4 gap-4 h-16 bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-900 hover:text-gray-600">
                Home
              </Link>
              <AdminLink />

            </div>
            <div className="flex items-center gap-4 text-black">
              <SignedOut>
                <SignInButton mode="modal" />
                {/* <SignUpButton mode="modal" /> */}
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </header>
          <Toaster />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
