'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, UserPlus, LogIn, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-surface shadow-xl fixed top-0 left-0 w-full z-50 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-display font-bold text-primary uppercase tracking-wider hover:text-primary-hover transition-colors">
              SportsBoard
            </Link>
          </div>
          <div className="flex items-center">
            {loading ? (
              <div className="h-8 w-24 bg-dark-bg rounded animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-text-muted">Welcome, <span className="text-primary font-semibold">{user.email}</span>!</span>
                {user.role === 'admin' && (
                  <Link
                    href="/admin/events"
                    className="text-primary hover:text-primary-hover transition-colors flex items-center gap-2 font-semibold"
                  >
                    <Shield size={18} />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-primary text-dark-bg px-4 py-2 rounded-md hover:bg-primary-hover transition-all flex items-center gap-2 font-semibold">
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-text-muted hover:text-primary transition-colors flex items-center gap-2"
                >
                  <LogIn size={18} />
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-primary text-dark-bg px-4 py-2 rounded-md hover:bg-primary-hover transition-all flex items-center gap-2 font-semibold"
                >
                  <UserPlus size={18} />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
