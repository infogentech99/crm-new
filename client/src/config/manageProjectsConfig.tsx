import { FlattenedProject } from '@customTypes/index';
import { Trash2, Pencil } from 'lucide-react';
import React from 'react';

export const manageProjectsConfig = (
  handleEditProject: (project: FlattenedProject) => void,
  handleDeleteProject: (project: FlattenedProject) => void,
  currentPage: number,
  limit: number
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: FlattenedProject, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'title', label: 'PROJECT NAME' },
    { key: 'leadName', label: 'LEAD NAME' },
    { key: 'industry', label: 'INDUSTRY' },
    { key: 'status', label: 'STATUS' },
    {
      key: 'actions',
      label: 'ACTIONS',
      align: 'right',
      render: (item: FlattenedProject) => (
        <div className="flex items-center justify-end space-x-2">
          <button className="text-blue-500 hover:text-blue-700 flex items-center cursor-pointer" onClick={() => handleEditProject(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center cursor-pointer" onClick={() => handleDeleteProject(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Manage Projects',
    showCreateProjectButton: true,
    tableColumns: filteredColumns,
  };
};
