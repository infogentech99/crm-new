'use client';
import React from 'react';

export default function LeadDetailsShimmer() {
  return (
    <div className="w-full px-8 py-6 bg-white shadow-sm rounded-md animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 w-40 bg-gray-200 rounded"></div>
        <div className="flex space-x-4">
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 w-3/4 bg-gray-200 rounded"></div>
          ))}
        </div>

        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 w-2/3 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
