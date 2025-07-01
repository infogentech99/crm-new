"use client";

import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardCards from "@components/Dashboard/DashboardCards";
import RecentActivityTable from "@components/Dashboard/RecentActivityTable";
import LeadStatusChart from "@components/Dashboard/LeadStatusChart";
import LeadSourceChart from "@components/Dashboard/LeadSourceChart";
import RevenueChart from "@components/Dashboard/RevenueChart";
import TaskStatusChart from "@components/Dashboard/TaskStatusChart";

export default function DashboardPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.token.token);
  const role = useSelector((state: RootState) => state.user.role);

  // Set page title
  useEffect(() => {
    document.title = "Dashboard – CRM Application";
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 select-none">
        Welcome to your Dashboard!
      </h1>
      <p className="text-gray-600 mb-8 select-none">
        Here&apos;s a quick overview of your CRM activities.
      </p>

      {/* Show DashboardCards only for non-accounts*/}
      {/* {role !== "accounts" && <DashboardCards />} */}

      <DashboardCards />

      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Show these only for non-accounts */}
        {role !== "accounts" && (
          <>
            <LeadStatusChart />
            <TaskStatusChart />
            <LeadSourceChart />
          </>
        )}

        {/* Always show revenue chart */}
        <RevenueChart />
      </div>

      
      {role !== "accounts" && <RecentActivityTable />} 
    </>
  );
}
