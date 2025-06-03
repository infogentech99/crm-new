"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@services/userService';
import DataTable from '@components/Common/DataTable';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { Button } from "@components/ui/button";
import DashboardLayout from "@components/Dashboard/DashboardLayout";

export default function ManageUsersPage() {
  const userRole = useSelector((state: RootState) => state.user.role);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
  });

  const columns = [
    { key: '_id', label: 'S.NO', render: () => 1 },
    { key: 'name', label: 'NAME' },
    { key: 'email', label: 'EMAIL' },
    { key: 'role', label: 'ROLE' },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: () => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700">View</button>
          <button className="text-red-500 hover:text-red-700">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 rounded-lg shadow-md bg-white">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Manage Users</h1>
        {userRole === 'superadmin' && (
          <Button className="mb-4">Create User</Button>
        )}
        <DataTable
          columns={columns}
          data={data?.users || []}
          isLoading={isLoading}
          error={isError ? error?.message || 'Unknown error' : null}
        />
      </div>
    </DashboardLayout>
  );
}
