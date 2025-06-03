"use client";

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';

export default function Header() {
  const user = useSelector((state: RootState) => state.user.name);

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      <div className="flex items-center">
        {user && <span className="mr-4 text-gray-700">Welcome, {user}!</span>}
      </div>
    </header>
  );
}
