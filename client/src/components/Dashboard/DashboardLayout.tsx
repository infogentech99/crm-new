"use client";

import React from 'react';
import Sidebar from '@components/Dashboard/Sidebar';
import Header from '@components/Dashboard/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
   <div className="flex justify-between h-screen bg-gray-100">
  {/* Sidebar */}
  <div className="w-64 h-full bg-gray-800 text-white">
    <Sidebar />
  </div>

  {/* Right content takes the remaining space */}
  <div className="flex flex-col flex-1">
    <Header />
    <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {children}
    </main>
  </div>
</div>

  );
}
