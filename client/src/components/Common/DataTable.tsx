"use client";

import React from 'react';
import { User } from '@customTypes/index'; // Assuming User type

interface DataTableProps {
  columns: {
    key: string;
    label: string;
    render?: (item: User, index?: number) => React.ReactNode; // Optional rendering function for custom content
  }[];
  data: User[];
  isLoading: boolean;
  error: string | null;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
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
      <div className="text-red-500 text-center bg-white p-6 rounded-lg shadow-md">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-50 backdrop-blur-md p-6 rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, i) => (
            <tr key={item._id} className="hover:bg-gray-100 transition-colors duration-200">
              {columns.map((column) => (
                <td
                  key={`${item._id}-${column.key}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                >
                  {column.render ? column.render(item, i) : item[column.key as keyof User]}
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
