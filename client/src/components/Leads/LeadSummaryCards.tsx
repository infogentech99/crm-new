"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@services/dashboardService';
import {
  Users,
  CheckCircle,
  FileText, // Using FileText for invoices, can be changed if a better icon is found
  XCircle,
} from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`flex items-center p-4 rounded-lg shadow-md text-white ${bgColor}`}>
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
};

const LeadSummaryCards: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center">
        Error loading summary: {error?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        title="Total Leads"
        value={data?.totalLeads || 0}
        icon={<Users size={24} />}
        bgColor="bg-blue-500"
      />
      <SummaryCard
        title="Approved Quotations"
        value={data?.approvedQuotations || 0}
        icon={<CheckCircle size={24} />}
        bgColor="bg-green-500"
      />
      <SummaryCard
        title="Approved Invoices"
        value={data?.approvedInvoices || 0}
        icon={<FileText size={24} />}
        bgColor="bg-purple-500"
      />
      <SummaryCard
        title="Lost Leads"
        value={data?.lostLeads || 0}
        icon={<XCircle size={24} />}
        bgColor="bg-red-500"
      />
    </div>
  );
};

export default LeadSummaryCards;
