"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { removeToken } from "@store/slices/tokenSlice";
import { removeUser } from "@store/slices/userSlice";
import { RootState } from "@store/store";

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
  FolderOpenDot,
  Phone,
  Wallet,
  ScrollText,
  Landmark,
  ChartNoAxesCombined,
} from "lucide-react";

interface SidebarItem {
  id: string;
  href: string;
  icon: React.ReactNode;
  label: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={24} />,
    label: "Dashboard",
  },
  {
    id: "users",
    href: "/dashboard/users",
    icon: <Users size={24} />,
    label: "Manage Users",
  },
  {
    id: "leads",
    href: "/dashboard/leads",
    icon: <ChartNoAxesCombined size={24} />,
    label: "All Leads",
  },
  {
    id: "contacts",
    href: "/dashboard/contacts",
    icon: <Phone  size={24}/>,
    label: "Contacts",
  },
  {
    id: "projects",
    href: "/dashboard/projects",
    icon: <FolderOpenDot  size={24}/>,
    label: "Projects",
  },
  {
    id: "quotations",
    href: "/dashboard/quotations",
    icon: <FileText size={24} />,
    label: "Quotations",
  },
  {
    id: "invoices",
    href: "/dashboard/invoices",
    icon: <Wallet size={24}/>,
    label: "Invoices",
  },
  {
    id: "bills",
    href: "/dashboard/bills",
    icon: <ScrollText size={24}/>,
    label: "Deals Bill",
  },
  {
    id: "transactions",
    href: "/dashboard/transactions",
    icon: <Landmark size={24} />,
    label: "Transactions",
  },
  {
    id: "meetings",
    href: "/dashboard/meetings",
    icon: <Calendar size={24} />,
    label: "Meetings",
  },
  {
    id: "tasks",
    href: "/dashboard/tasks",
    icon: <ListChecks size={24} />,
    label: "Task Assigning",
  }
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const role = useSelector((state: RootState) => state.user.role);

  const handleLogout = () => {
    dispatch(removeToken());
    dispatch(removeUser());
    localStorage.removeItem("token");
    router.push("/");
  };
  const filteredItems = sidebarItems.filter(item => {
    if (item.id === "users" && role !== "superadmin") {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed top-0 left-0 h-screen w-16 bg-gray-800 text-gray-200 flex flex-col  shadow-lg z-50">
      <div className="flex flex-col h-full ">
        {filteredItems.map(item => (
          <Link href={item.href} key={item.id}>
            <div
              className={`relative py-4 space-y-2 flex justify-center items-center cursor-pointer rounded ${
                pathname === item.href ? "bg-gray-700" : "hover:bg-red-600"
              }`}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
            >
              {item.icon}
              {hoveredItemId === item.id && (
                <span className="absolute left-full ml-3 whitespace-nowrap bg-gray-700 text-white text-xs px-3 py-2 rounded">
                  {item.label}
                </span>
              )}
            </div>
          </Link>
        ))}

        <div
          className="relative mt-auto flex justify-center items-center py-4 cursor-pointer hover:bg-red-700 rounded mb-4"
          onClick={handleLogout}
          onMouseEnter={() => setHoveredItemId("logout")}
          onMouseLeave={() => setHoveredItemId(null)}
        >
          <LogOut size={24} />
          {hoveredItemId === "logout" && (
            <span className="absolute left-full ml-3 whitespace-nowrap bg-gray-700 text-white text-xs px-3  rounded">
              Logout
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
