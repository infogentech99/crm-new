"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@services/dashboardService';
import NoDataFound from '@components/Common/NoDataFound';
import { RootState } from '@store/store';
import { useSelector } from 'react-redux';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#0088FE', '#A4DE6C', '#D0ED57', '#83A6ED', '#8DD1E1', '#82CA9D', '#C1F0F6', '#FFC0CB'];

const ALL_LEAD_SOURCES = [
  'Website', 'Referral', 'LinkedIn', 'Cold Call', 'Facebook', 'Google',
  'Instagram', 'Twitter', 'Advertisement', 'Event', 'Partnership', 'Other'
];

export default function LeadSourceChart() {
  const role = useSelector((state: RootState) => state.user.role);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => fetchDashboardSummary(role || ''),
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse h-80">
        <div className="h-6 bg-gray-200 w-1/2 mb-4"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center bg-white p-6 rounded-lg shadow-md h-80">
        Error loading lead source data: {error?.message || 'Unknown error'}
      </div>
    );
  }

  const summaryData = data?.leadSourceSummary || {};
  
  // Create chartData ensuring all sources are present, even if count is 0
  const chartData = ALL_LEAD_SOURCES.map((source, index) => ({
    name: source,
    value: summaryData[source] || 0,
    color: COLORS[index % COLORS.length], // Assign a color to each bar
  }));

  // Only show "No lead source data available" if all counts are zero
  const hasData = chartData.some(item => item.value > 0);

  if (!hasData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-80 flex items-center justify-center">
        <p className="text-gray-500"><NoDataFound/></p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Leads by Source</h2>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="color" /> {/* Use the 'color' property from chartData */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
