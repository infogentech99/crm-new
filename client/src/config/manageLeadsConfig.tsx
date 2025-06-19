import BadgeDot from '@components/BadgeDot';
import { Lead, User } from '@customTypes/index';
import dayjs from 'dayjs';
import { Eye, Trash2, Pencil } from 'lucide-react';
import React from 'react';
import { DataTableProps } from '@components/Common/DataTable'; // Import DataTableProps

export const manageLeadsConfig = (
  handleViewLead: (lead: Lead) => void,
  handleEditLead: (lead: Lead) => void,
  handleDeleteLead: (lead: Lead) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns: DataTableProps<Lead>['columns'] = [
    { key: '_id', label: 'S.NO', render: (item: Lead, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'name', label: 'NAME' },
    { key: 'company', label: 'COMPANY' },
    {
      key: 'leadGenerate',
      label: 'LEAD GENERATE',
      render: (item: Lead) => {
        if (typeof item.createdBy === 'object' && item.createdBy !== null) {
          return <span>{(item.createdBy as User).name}</span>;
        }
        return <span>{dayjs(item.createdAt).format('DD/MM/YYYY hh:mm A')}</span>;
      },
    },
    {
      key: 'callResponse',
      label: 'CALL RESPONSE',
      render: (item: Lead) => <BadgeDot label={item.callResponse || '-'} type="callResponse" />,
    },
    { key: 'remark', label: 'REMARK', render: (item: Lead) => <span>{item.remark || '-'}</span> },
    {
  key: 'latestProject',
  label: 'Latest Project',
  render: (lead: Lead) => {
    const lastProject = lead.projects?.[lead.projects.length - 1];
    if (!lastProject) return <span className="text-gray-400 italic">No Project</span>;
    return (
      <div className="flex flex-col">
        <span className="font-medium text-black">{lastProject.title}</span>
        <BadgeDot label={lastProject.status || 'new'} type="status" />
      </div>
    );
  }},


    {
      key: 'actions',
      label: 'ACTIONS',
      align: 'right',
      render: (item: Lead) => (
        <div className="flex items-center justify-end space-x-2">
          <button className="text-gray-500 hover:text-gray-700 flex items-center cursor-pointer" onClick={() => handleViewLead(item)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-blue-500 hover:text-blue-700 flex items-center cursor-pointer" onClick={() => handleEditLead(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center cursor-pointer" onClick={() => handleDeleteLead(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  let filteredColumns = [...baseColumns];

  if (userRole === 'superadmin' || userRole === 'admin') {
    const emailColumn = { key: 'email', label: 'EMAIL' };
    const phoneColumn = { key: 'phone', label: 'PHONE' };

    filteredColumns = [
      ...baseColumns.slice(0, 2), 
         emailColumn,
      phoneColumn,
      ...baseColumns.slice(2), 
    ];
  }

  return {
    pageTitle: 'Manage Leads',
    showCreateLeadButton: true,
    createLeadButtonAction: () => alert('Create Lead functionality is under development.'),
    tableColumns: filteredColumns,
  };
};
