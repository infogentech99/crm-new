"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { removeToken } from '@store/slices/tokenSlice';
import { removeUser } from '@store/slices/userSlice';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(removeToken());
    dispatch(removeUser());
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col p-4">
      <div className="text-2xl font-bold mb-6">CRM Dashboard</div>
      <nav className="flex-1">
        <ul>
          <li className="mb-2">
            <Link href="/dashboard" className={`block py-2 px-4 rounded ${pathname === '/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/dashboard/leads" className={`block py-2 px-4 rounded ${pathname === '/dashboard/leads' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              Leads
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/dashboard/contacts" className={`block py-2 px-4 rounded ${pathname === '/dashboard/contacts' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              Contacts
            </Link>
          </li>
          {/* Add more navigation links as needed */}
        </ul>
      </nav>
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
