"use client";

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@services/dashboardService';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor }) => (
  <div className={`flex items-center p-4 rounded-lg shadow-md ${bgColor} text-white`}>
    <div className="mr-4 text-3xl">{icon}</div>
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default function DashboardCards() {
  const role = useSelector((state: RootState) => state.user.role);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardSummary', role],
    queryFn: () => fetchDashboardSummary(role || ''),
  });

  if (isLoading) {
    // accounts sees 3 placeholders, others 4
    const count = role === 'accounts' ? 3 : 4;
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-6 mb-8`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center p-4 rounded-lg shadow-md bg-gray-200 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center mb-8">
        Error loading dashboard summary: {(error as Error).message}
      </div>
    );
  }

  // if accounts role, show only projects/quotations/invoices
  if (role === 'accounts') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* <StatCard
          title="Total Projects"
          value={data?.totalProjects?.toLocaleString() ?? '0'}
          icon="📁"
          bgColor="bg-indigo-500"
        /> */}
        <StatCard
        title="Total Amount of Open Deals"
        value={`₹${data?.totalInvoicesAmount}`}
        icon="💰"
        bgColor="bg-yellow-500"
      />
        <StatCard
          title="Final Invoices"
          value={data?.totalFinalInvoices?.toLocaleString() ?? '0'}
          icon="🧾"
          bgColor="bg-purple-500"
        />
        {/* <StatCard
          title="Approved Quotations"
          value={data.approvedQuotations?.toLocaleString() ?? '0'}
          icon="📝"
          bgColor="bg-blue-500"
        />
        <StatCard
          title="Approved Invoices"
          value={data.approvedInvoices?.toLocaleString() ?? '0'}
          icon="📄"
          bgColor="bg-green-500"
        /> */}
      </div>
    );
  }

  // default for all other roles
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Leads"
        value={data?.totalLeads?.toLocaleString() ?? '0'}
        icon="📈"
        bgColor="bg-blue-500"
      />
      <StatCard
        title="New Contacts"
        value={data?.newContacts?.toLocaleString() ?? '0'}
        icon="👥"
        bgColor="bg-green-500"
      />
      <StatCard
        title="Total Amount of Open Deals"
        value={`₹${data?.totalInvoicesAmount ?? '0'}`}
        icon="💰"
        bgColor="bg-yellow-500"
      />
      <StatCard
        title="Tasks Due"
        value={data?.tasksDue?.toLocaleString() ?? '0'}
        icon="📅"
        bgColor="bg-red-500"
      />
      {role === 'superadmin' && (
        <StatCard
          title="Final Invoices"
          value={data?.totalFinalInvoices?.toLocaleString() ?? '0'}
          icon="🧾"
          bgColor="bg-purple-500"
        />
      )}
    </div>
  );
}
