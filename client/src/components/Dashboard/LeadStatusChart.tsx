"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useDashboardSummary } from '@hooks/useDashboardSummary';
import NoDataFound from '@components/Common/NoDataFound';
import { DashboardSummary } from '@customTypes/index';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function LeadStatusChart() {
  const { data, isLoading, isError, error } = useDashboardSummary();

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
        Error loading lead status data: {error?.message || 'Unknown error'}
      </div>
    );
  }

  const summaryData: { [key: string]: number } = data?.leadStatusSummary || {};
  const chartData = Object.keys(summaryData).map(status => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()), // Format status for display
    value: summaryData[status],
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-100 flex items-center justify-center">
        <p className="text-gray-500"><NoDataFound/></p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-100">
      <h2 className="text-xl font-semibold  text-gray-800 mb-4">Leads by Status</h2>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
