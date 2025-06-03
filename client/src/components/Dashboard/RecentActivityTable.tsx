"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRecentActivities } from '@services/dashboardService';
import { RecentActivity } from '@customTypes/index';

export default function RecentActivityTable() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: fetchRecentActivities,
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 h-6 bg-gray-200 w-1/2"></h2>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center bg-white p-6 rounded-lg shadow-md">
        Error loading recent activities: {error?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
      {data && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((activity: RecentActivity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {activity.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No recent activities found.</p>
      )}
    </div>
  );
}
