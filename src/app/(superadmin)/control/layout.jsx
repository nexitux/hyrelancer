// src/app/(superadmin)/control/layout.jsx
'use client';

import React, { useEffect } from 'react';
import "@/styles/globals.css";
import Sidebar from "../components/Sidebar/page";
import Header from "../components/Header/page";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function SuperAdminLayout({ children }) {
  const router = useRouter();
  const isAuthenticated = useSelector((s) => s.admin?.isAuthenticated);

  useEffect(() => {
    // Only redirect when we *know* the user is unauthenticated.
    if (typeof isAuthenticated === 'boolean' && !isAuthenticated) {
      router.replace('/gateway'); // replace so back button doesn't return to protected page
    }
  }, [isAuthenticated, router]);

  // If not authenticated (or auth still resolving), render nothing to avoid flashing protected UI.
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content with header */}
      <div className="flex flex-col flex-1 overflow-x-scroll">
        <Header />
        <main className="">{children}</main>
      </div>
    </div>
  );
}
