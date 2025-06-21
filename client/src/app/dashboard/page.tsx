"use client";

import DashboardLayout from "@components/Dashboard/DashboardLayout";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardCards from "@components/Dashboard/DashboardCards";
import RecentActivityTable from "@components/Dashboard/RecentActivityTable";

export default function DashboardPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.token.token);
 useEffect(() => {
   document.title = "Dashboard – CRM Application";
 }, []);
  useEffect(() => {
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  if (!token) {
    return null; 
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 select-none">Welcome to your Dashboard!</h1>
      <p className="text-gray-600 mb-8 select-none">Here&#39;s a quick overview of your CRM activities.</p>
      <DashboardCards />
      <RecentActivityTable />
    </DashboardLayout>
  );
}
