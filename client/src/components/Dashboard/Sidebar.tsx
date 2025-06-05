"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { removeToken } from '@store/slices/tokenSlice';
import { removeUser } from '@store/slices/userSlice';
import { useRouter } from 'next/navigation';


import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MessageSquare,
  FileText,
  Receipt,
  Repeat,
  Calendar,
  ListChecks,
  LogOut,
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive }) => {
  return (
    <li className="mb-2">
      <Link href={href} className={`flex items-center py-2 px-4 rounded ${
        isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-white'
      }`}>
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  );
};

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
   <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg z-50">
      <div className="text-2xl font-bold mb-8 text-center">CRM App</div> 
      
      <nav className="flex-1">
        <h3 className="text-xs font-semibold uppercase text-gray-400 mb-4">GENERAL</h3>
        <ul>
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            isActive={pathname === '/dashboard'}
          />
        </ul>

        <h3 className="text-xs font-semibold uppercase text-gray-400 mt-8 mb-4">MANAGEMENT</h3>
        <ul>
          <NavItem
            href="/dashboard/users"
            icon={<Users size={20} />}
            label="Manage Users"
            isActive={pathname === '/dashboard/users'}
          />
          <NavItem
            href="/dashboard/leads"
            icon={<ClipboardList size={20} />}
            label="All Leads"
            isActive={pathname === '/dashboard/leads'}
          />
          <NavItem
            href="/dashboard/contacts"
            icon={<MessageSquare size={20} />}
            label="Contacts"
            isActive={pathname === '/dashboard/contacts'}
          />
          <NavItem
            href="/dashboard/quotations"
            icon={<FileText size={20} />}
            label="Quotations"
            isActive={pathname === '/dashboard/quotations'}
          />
          <NavItem
            href="/dashboard/invoices"
            icon={<Receipt size={20} />}
            label="Invoices"
            isActive={pathname === '/dashboard/invoices'}
          />
          <NavItem
            href="/dashboard/bills"
            icon={<ListChecks size={20} />} 
            label="Deals Bill"
            isActive={pathname === '/dashboard/bills'}
          />
          <NavItem
            href="/dashboard/transactions"
            icon={<Repeat size={20} />}
            label="Transactions"
            isActive={pathname === '/dashboard/transactions'}
          />
          <NavItem
            href="/dashboard/meetings"
            icon={<Calendar size={20} />}
            label="Meetings"
            isActive={pathname === '/dashboard/meetings'}
          />
          <NavItem
            href="/dashboard/tasks"
            icon={<ListChecks size={20} />}
            label="Task Assigning"
            isActive={pathname === '/dashboard/tasks'}
          />
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full py-2 px-4 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
