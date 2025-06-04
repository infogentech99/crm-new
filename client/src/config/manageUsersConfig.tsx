import { User } from '@customTypes/index';
import { Eye, Trash2 } from 'lucide-react';
import React from 'react';

export const manageUsersConfig = (handleViewUser: (user: User) => void) => ({
  pageTitle: 'Manage Users',
  showCreateUserButton: true,
  createUserButtonAction: () => alert('Create User functionality is under development.'),
  tableColumns: [
    { key: '_id', label: 'S.NO', render: (item: User, index?: number) => <span>{index !== undefined ? index + 1 : ''}</span> },
    { key: 'name', label: 'NAME' },
    { key: 'email', label: 'EMAIL' },
    { key: 'role', label: 'ROLE' },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (item: User) => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700 flex items-center" onClick={() => handleViewUser(item)}>
            <Eye className="h-4 w-4 mr-1" /> View
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </button>
        </div>
      ),
    },
  ],
});
