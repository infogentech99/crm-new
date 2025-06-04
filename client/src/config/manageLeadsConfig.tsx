import { Lead, User } from '@customTypes/index';
import { Eye, Trash2, Pencil } from 'lucide-react';
import React from 'react';

export const manageLeadsConfig = (
  handleViewLead: (lead: Lead) => void,
  handleEditLead: (lead: Lead) => void,
  handleDeleteLead: (lead: Lead) => void,
  userRole: string // Add userRole parameter
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: Lead, index?: number) => <span>{index !== undefined ? index + 1 : ''}</span> },
    { key: 'name', label: 'NAME' },
    { key: 'company', label: 'COMPANY' },
    {
      key: 'leadGenerate',
      label: 'LEAD GENERATE',
      render: (item: Lead) => {
        if (typeof item.createdBy === 'object' && item.createdBy !== null) {
          return <span>{(item.createdBy as User).name}</span>;
        }
        return <span>{item.createdBy}</span>;
      },
    },
    {
      key: 'callResponse',
      label: 'CALL RESPONSE',
      render: (item: Lead) => (
        <div className="flex items-center">
          <span>{item.callResponse}</span>
          {item.callResponse === 'Picked' && <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>}
          {item.callResponse === 'Not Response' && <span className="ml-2 h-2 w-2 rounded-full bg-red-500"></span>}
          {item.callResponse === 'Talk to later' && <span className="ml-2 h-2 w-2 rounded-full bg-yellow-500"></span>}
        </div>
      ),
    },
    { key: 'remark', label: 'REMARK', render: (item: Lead) => <span>{item.remark || '-'}</span> },
    {
      key: 'status',
      label: 'STATUS',
      render: (item: Lead) => (
        <div className="flex items-center">
          <span>{item.status}</span>
          {item.status === 'approved' && <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>}
          {item.status === 'denied' && <span className="ml-2 h-2 w-2 rounded-full bg-red-500"></span>}
          {item.status === 'pending_approval' && <span className="ml-2 h-2 w-2 rounded-full bg-yellow-500"></span>}
          {/* Add more status colors as needed */}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (item: Lead) => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700 flex items-center" onClick={() => handleViewLead(item)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-blue-500 hover:text-blue-700 flex items-center" onClick={() => handleEditLead(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center" onClick={() => handleDeleteLead(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  let filteredColumns = [...baseColumns];

  // Conditionally add email and phone based on user role
  if (userRole === 'superadmin' || userRole === 'admin') {
    const emailColumn = { key: 'email', label: 'EMAIL' };
    const phoneColumn = { key: 'phone', label: 'PHONE' };

    filteredColumns = [
      ...baseColumns.slice(0, 2), // Elements before index 2
      emailColumn,
      phoneColumn,
      ...baseColumns.slice(2), // Elements from index 2 onwards
    ];
  }

  return {
    pageTitle: 'Manage Leads',
    showCreateLeadButton: true,
    createLeadButtonAction: () => alert('Create Lead functionality is under development.'),
    tableColumns: filteredColumns,
  };
};
