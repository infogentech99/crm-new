"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@services/userService';
import DataTable from '@components/Common/DataTable';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import CreateUserButton from '@components/Common/CreateUserButton';
import { manageUsersConfig } from '@config/manageUsersConfig';

export default function ManageUsersPage() {
  const userRole = useSelector((state: RootState) => state.user.role);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
  });

  return (
    <DashboardLayout>
      <div className="p-6 rounded-lg  shadow-md bg-white">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">{manageUsersConfig.pageTitle}</h1>
        {manageUsersConfig.showCreateUserButton && (
          <CreateUserButton
            userRole={userRole}
            onClick={() => alert('Create User functionality is under development.')}
          />
        )}
        <DataTable
          columns={manageUsersConfig.tableColumns}
          data={data?.users || []}
          isLoading={isLoading}
          error={isError ? error?.message || 'Unknown error' : null}
        />
      </div>
    </DashboardLayout>
  );
}
