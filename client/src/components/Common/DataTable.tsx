"use client";

import React from 'react';
import { cn } from "@lib/utils"; // Import cn

interface DataTableProps<T extends { _id: string }> { // T must have an _id for keying
  columns: {
    key: string;
    label: string;
    render?: (item: T, index?: number) => React.ReactNode; // Optional rendering function for custom content
  }[];
  data: T[];
  isLoading: boolean;
  error: string | null;
  className?: string; // Allow custom classNames
}

const DataTable = <T extends { _id: string }>( { columns, data, isLoading, error, className }: DataTableProps<T> ) => {
  if (isLoading) {
    return (
      <div className={cn("p-6 rounded-lg shadow-md animate-pulse", className)}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 h-6 bg-gray-200 w-1/2"></h2>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-red-500 text-center p-6 rounded-lg shadow-md", className)}>
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div className={cn(
      "relative overflow-x-auto rounded-lg shadow-lg",
      "bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg border border-opacity-30 border-white", // Glassmorphism effect
      className
    )}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 bg-opacity-30">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, i) => (
            <tr key={item._id} className="bg-white bg-opacity-50 hover:bg-opacity-70 transition-colors duration-200">
              {columns.map((column) => (
                <td
                  key={`${item._id}-${column.key}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                >
                  {column.render ? column.render(item, i) : (item[column.key as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
