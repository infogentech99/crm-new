"use client";

import React from "react";
import Sidebar from "@components/Dashboard/Sidebar";
import Header from "@components/Dashboard/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>   
      <Sidebar />  
      <div className="ml-16 flex flex-col min-h-screen bg-gray-100">      
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </>
  );
}
