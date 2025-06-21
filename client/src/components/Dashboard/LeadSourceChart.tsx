"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@services/dashboardService';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#0088FE'];

export default function LeadSourceChart() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary,
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
  const chartData = Object.keys(summaryData).map(source => ({
    name: source,
    value: summaryData[source],
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-80 flex items-center justify-center">
        <p className="text-gray-500">No lead source data available.</p>
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
          <Bar dataKey="value" fill={COLORS[0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
