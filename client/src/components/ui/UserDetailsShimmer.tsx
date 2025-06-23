// File: src/components/Common/UserDetailsShimmer.tsx
'use client';

import React from 'react';

export default function UserDetailsShimmer() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="w-full px-8 py-6 bg-white shadow-sm rounded-md animate-pulse">
        <div className="flex justify-between items-center mb-6">
          {/* Title */}
          <div className="h-6 w-32 bg-gray-200 rounded" />
          {/* Buttons */}
          <div className="flex space-x-4">
            <div className="h-10 w-24 bg-gray-200 rounded" />
           
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-3/4 bg-gray-200 rounded" />
            ))}
          </div>
          {/* Right column */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-2/3 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="w-full px-8 py-6 bg-white shadow-sm rounded-md animate-pulse">
        {/* Section header */}
        <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mb-4">
          <div className="h-10 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-14 bg-gray-200 rounded" />
        </div>

        {/* Activity list */}
        <ul className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <li key={i} className="flex justify-between items-center">
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
