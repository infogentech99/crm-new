"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { removeToken } from "@store/slices/tokenSlice";
import { removeUser } from "@store/slices/userSlice";
import { useRouter } from "next/navigation";

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
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  icon,
  label,
  isActive,
  onClick,
}) => {
  const baseClasses =
    "flex items-center py-2 px-4 rounded transition-colors duration-150";
  const activeClasses = "bg-gray-700 text-white";
  const inactiveClasses = "hover:bg-gray-700 text-white";

  return (
    <li onClick={onClick}>
      <Link
        href={href}
        className={`${baseClasses} ${
          isActive ? activeClasses : inactiveClasses
        }`}
      >
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
  const [hoveredSection, setHoveredSection] = useState<
    "crm" | "sales" | "service" | null
  >(null);

  const handleLogout = () => {
    dispatch(removeToken());
    dispatch(removeUser());
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-16 bg-gray-800 text-gray-200 flex flex-col shadow-lg z-50">
      {/* Top icons */}
      <div className="flex flex-col w-16 py-4 space-y-4">
        {/* CRM icon */}
        <div
          className="flex justify-center items-center p-2 cursor-pointer hover:bg-gray-700 rounded"
          onMouseEnter={() => setHoveredSection("crm")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <LayoutDashboard size={24} />
        </div>

        {/* Sales Hub icon */}
        <div
          className="flex justify-center items-center p-2 cursor-pointer hover:bg-gray-700 rounded"
          onMouseEnter={() => setHoveredSection("sales")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <ClipboardList size={24} />
        </div>

        {/* Services icon */}
        <div
          className="flex justify-center items-center p-2 cursor-pointer hover:bg-gray-700 rounded"
          onMouseEnter={() => setHoveredSection("service")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <ListChecks size={24} />
        </div>

        <div className="flex-1" />

        {/* Logout icon */}
        <div
          className="flex justify-center items-center p-2 cursor-pointer hover:bg-gray-700 rounded mb-4"
          onClick={handleLogout}
        >
          <LogOut size={24} />
        </div>
      </div>

      {/* Slide‐out panel for CRM */}
      {hoveredSection === "crm" && (
        <div
          className="absolute left-16 top-0 h-screen w-56 bg-gray-700 text-gray-100 p-4 border-l border-gray-600"
          onMouseEnter={() => setHoveredSection("crm")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <h2 className="text-lg font-semibold text-white mb-4">CRM</h2>

          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
            GENERAL
          </h3>
          <ul className="mb-4 space-y-1">
            <NavItem
              href="/dashboard"
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              isActive={pathname === "/dashboard"}
              onClick={() => setHoveredSection(null)}
            />
          </ul>

          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
            MANAGEMENT
          </h3>
          <ul className="space-y-1">
            <NavItem
              href="/dashboard/users"
              icon={<Users size={20} />}
              label="Manage Users"
              isActive={pathname === "/dashboard/users"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/dashboard/leads"
              icon={<ClipboardList size={20} />}
              label="All Leads"
              isActive={pathname === "/dashboard/leads"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/dashboard/contacts"
              icon={<MessageSquare size={20} />}
              label="Contacts"
              isActive={pathname === "/dashboard/contacts"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/dashboard/quotations"
              icon={<FileText size={20} />}
              label="Quotations"
              isActive={pathname === "/dashboard/quotations"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/dashboard/invoices"
              icon={<Receipt size={20} />}
              label="Invoices"
              isActive={pathname === "/dashboard/invoices"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/dashboard/bills"
              icon={<ListChecks size={20} />}
              label="Deals Bill"
              isActive={pathname === "/dashboard/bills"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/dashboard/transactions"
              icon={<Repeat size={20} />}
              label="Transactions"
              isActive={pathname === "/dashboard/transactions"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/dashboard/meetings"
              icon={<Calendar size={20} />}
              label="Meetings"
              isActive={pathname === "/dashboard/meetings"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/dashboard/tasks"
              icon={<ListChecks size={20} />}
              label="Task Assigning"
              isActive={pathname === "/dashboard/tasks"}
              onClick={() => setHoveredSection(null)}
            />
          </ul>
        </div>
      )}

      {/* Slide‐out panel for Sales Hub */}
      {hoveredSection === "sales" && (
        <div
          className="absolute left-16 top-0 h-screen w-56 bg-gray-700 text-gray-100 p-4 border-l border-gray-600"
          onMouseEnter={() => setHoveredSection("sales")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Sales Hub</h2>

          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
            OVERVIEW
          </h3>
          <ul className="mb-4 space-y-1">
            <NavItem
              href="/sales/overview"
              icon={<ClipboardList size={20} />}
              label="Overview"
              isActive={pathname === "/sales/overview"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/sales/pipeline"
              icon={<Repeat size={20} />}
              label="Pipeline"
              isActive={pathname === "/sales/pipeline"}
              onClick={() => setHoveredSection(null)}
            />
          </ul>

          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
            REPORTS
          </h3>
          <ul className="space-y-1">
            <NavItem
              href="/sales/reports"
              icon={<FileText size={20} />}
              label="Reports"
              isActive={pathname === "/sales/reports"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/sales/analytics"
              icon={<LayoutDashboard size={20} />}
              label="Analytics"
              isActive={pathname === "/sales/analytics"}
              onClick={() => setHoveredSection(null)}
            />
          </ul>
        </div>
      )}

      {/* Slide‐out panel for Services */}
      {hoveredSection === "service" && (
        <div
          className="absolute left-16 top-0 h-screen w-56 bg-gray-700 text-gray-100 p-4 border-l border-gray-600"
          onMouseEnter={() => setHoveredSection("service")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Services</h2>

          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
            SUPPORT
          </h3>
          <ul className="mb-4 space-y-1">
            <NavItem
              href="/service/tickets"
              icon={<MessageSquare size={20} />}
              label="Tickets"
              isActive={pathname === "/service/tickets"}
              onClick={() => setHoveredSection(null)}
            />
            <NavItem
              href="/service/knowledge"
              icon={<FileText size={20} />}
              label="Knowledge Base"
              isActive={pathname === "/service/knowledge"}
              onClick={() => setHoveredSection(null)}
            />
          </ul>

          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
            SETTINGS
          </h3>
          <ul className="space-y-1">
            <NavItem
              href="/service/settings"
              icon={<LayoutDashboard size={20} />}
              label="Config"
              isActive={pathname === "/service/settings"}
              onClick={() => setHoveredSection(null)}
            />
          </ul>
        </div>
      )}
    </div>
  );
}
