"use client";

import React, { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@services/userService';
import DataTable from '@components/Common/DataTable';
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import CreateUserButton from '@components/Common/CreateUserButton';
import { manageUsersConfig } from '@config/manageUsersConfig';
import Modal from '@components/Common/Modal';
import { User } from '@customTypes/index';

const ManageUsersPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const config = manageUsersConfig(handleViewUser);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
  });

  return (
    <DashboardLayout>
      <div className="p-6 rounded-lg shadow-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">{config.pageTitle}</h1>
          <CreateUserButton onClick={() => alert('Create User functionality is under development.')} />
        </div>
        <DataTable
          columns={config.tableColumns}
          data={data?.users || []}
          isLoading={isLoading}
          error={isError ? error?.message || 'Unknown error' : null}
        />
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          {selectedUser && (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">User Details</h2>
              <p>Name: {selectedUser.name}</p>
              <p>Email: {selectedUser.email}</p>
              <p>Role: {selectedUser.role}</p>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageUsersPage;
