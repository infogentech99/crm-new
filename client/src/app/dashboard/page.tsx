"use client";

import DashboardLayout from "@components/Dashboard/DashboardLayout";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.token.token);

  useEffect(() => {
    if (!token) {
      router.push("/"); // Redirect to login if not authenticated
    }
  }, [token, router]);

  if (!token) {
    return null; // Or a loading spinner
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to your Dashboard!</h1>
      <p className="text-gray-600">This is a placeholder for your CRM dashboard content.</p>
      {/* More dashboard content will go here */}
    </DashboardLayout>
  );
}
