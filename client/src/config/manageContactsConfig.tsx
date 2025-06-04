import { Contact } from '@customTypes/index'; // Use Contact interface
import { Eye, Trash2, Pencil } from 'lucide-react';
import React from 'react';

export const manageContactsConfig = (
  handleViewContact: (contact: Contact) => void,
  handleEditContact: (contact: Contact) => void,
  handleDeleteContact: (contact: Contact) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: Contact, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'name', label: 'NAME' },
    { key: 'email', label: 'EMAIL' }, // Always include email for contacts
    { key: 'phone', label: 'PHONE' }, // Always include phone for contacts
    { key: 'company', label: 'COMPANY' },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (item: Contact) => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700 flex items-center" onClick={() => handleViewContact(item)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-blue-500 hover:text-blue-700 flex items-center" onClick={() => handleEditContact(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center" onClick={() => handleDeleteContact(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // No conditional filtering based on user role for contacts, as email and phone are always included
  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Manage Contacts',
    showCreateContactButton: true,
    createContactButtonAction: () => alert('Create Contact functionality is under development.'),
    tableColumns: filteredColumns,
  };
};
