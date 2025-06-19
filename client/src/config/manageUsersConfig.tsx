// File: src/config/manageUsersConfig.ts

import { User } from "@customTypes/index";
import { Eye, Pencil, Trash2 } from "lucide-react";
import React from "react";

export interface ManageUsersConfig {
  pageTitle: string;
  showCreateUserButton: boolean;
  createUserButtonAction: () => void;
  tableColumns: {
    key: string;
    label: string;
    render?: (item: User, index?: number) => React.ReactNode;
  }[];
}

/**
 * @param handleViewUser   Called when clicking “View” icon in a row
 * @param handleEditUser   Called when clicking “Edit” icon in a row
 * @param handleDeleteUser Called when clicking “Delete” icon in a row
 * @param handleCreateUser Called when clicking the “Create User” button
 */
export const manageUsersConfig = (
  handleViewUser: (user: User) => void,
  handleEditUser: (user: User) => void,
  handleDeleteUser: (user: User) => void,
  handleCreateUser: () => void
): ManageUsersConfig => {
  const columns = [
    {
      key: "_id",
      label: "S.NO",
      render: (item: User, index?: number) => (
        <span>{index !== undefined ? index + 1 : ""}</span>
      ),
    },
    { key: "name", label: "NAME" },
    { key: "email", label: "EMAIL" },
    { key: "role", label: "ROLE" },
    {
      key: "actions",
      label: "ACTIONS",
      align: 'right',
      render: (item: User) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            className="text-gray-500 hover:text-gray-700 flex items-center"
            onClick={() => handleViewUser(item)}
          >
            <Eye className="h-4 w-4 mr-1" />
          </button>
          
          <button
            className="text-blue-500 hover:text-blue-700 flex items-center"
            onClick={() => handleEditUser(item)}
          >
            <Pencil className="h-4 w-4 mr-1" />
          </button>
          <button
            className="text-red-500 hover:text-red-700 flex items-center"
            onClick={() => handleDeleteUser(item)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
          </button>
        </div>
      ),
    },
  ];

 return {
  pageTitle: "Manage Users",
  showCreateUserButton: true,
  createUserButtonAction: handleCreateUser,
  tableColumns: columns,
};
};
