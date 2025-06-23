"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@services/dashboardService';

export default function RevenueChart() {
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
        Error loading revenue data: {error?.message || 'Unknown error'}
      </div>
    );
  }

  const revenueData = data?.monthlyRevenue || []; // Assuming monthlyRevenue will be an array of { name: string, revenue: number }
  
  if (revenueData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-80 flex items-center justify-center">
        <p className="text-gray-500">No revenue data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={revenueData}
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
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
