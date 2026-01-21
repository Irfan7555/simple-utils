'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { refreshAuth, logoutUser } from '../lib/api';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Try to refresh token on mount to see if we have a valid session
    const checkAuth = async () => {
        try {
            await refreshAuth();
            setIsLoggedIn(true);
        } catch (e) {
            setIsLoggedIn(false);
        }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
        await logoutUser();
        setIsLoggedIn(false);
        router.push('/login');
        router.refresh();
    } catch(e) {
        console.error("Logout failed", e);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div className="text-2xl font-extrabold tracking-tight">
          <Link href="/" className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all">
            MyBlog
          </Link>
        </div>
        <div className="hidden md:flex space-x-8 items-center font-medium text-sm">
          <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/blogs" className="text-slate-600 hover:text-blue-600 transition-colors">
            Blogs
          </Link>
          <Link href="/dashboard" className="text-slate-600 hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          
          {isLoggedIn ? (
             <button 
               onClick={handleLogout}
               className="text-red-600 hover:text-red-700 transition-colors font-medium"
             >
               Logout
             </button>
          ) : (
             <Link href="/login" className="text-blue-600 hover:text-blue-700 transition-colors font-semibold">
               Login
             </Link>
          )}
        </div>
        <div className="md:hidden">
             {/* Mobile menu button could go here */}
             <span className="text-slate-500">Menu</span>
        </div>
      </div>
    </nav>
  );
}
