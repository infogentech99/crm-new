"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@services/dashboardService';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`flex items-center p-4 rounded-lg shadow-md ${bgColor} text-white`}>
      <div className="mr-4 text-3xl">{icon}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default function DashboardCards() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center p-4 rounded-lg shadow-md bg-gray-200 animate-pulse h-24"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center mb-8">
        Error loading dashboard summary: {error?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Leads"
        value={data?.totalLeads.toLocaleString() || 'N/A'}
        icon="📈"
        bgColor="bg-blue-500"
      />
      <StatCard
        title="New Contacts"
        value={data?.newContacts.toLocaleString() || 'N/A'}
        icon="👥"
        bgColor="bg-green-500"
      />
      <StatCard
        title="Total Amount of Open Deals"
        value={`₹${data?.totalInvoicesAmount ?? '0.00'}`}
        icon="💰"
        bgColor="bg-yellow-500"
      />
      {/* <StatCard
        title="Total Paid of Open Deals"
        value={`₹${data?.totalPaidInvoicesAmount ?? '0.00'}`}
        icon="✅"
        bgColor="bg-purple-500"
      />
      <StatCard
        title="Pending Invoices"
        value={`₹${data?.pendingAmount ?? '0.00'}`}
        icon="⏳"
        bgColor="bg-orange-500"
      /> */}
      <StatCard
        title="Tasks Due"
        value={data?.tasksDue.toLocaleString() ?? '0'}
        icon="📅"
        bgColor="bg-red-500"
      />
    </div>
  );
}
