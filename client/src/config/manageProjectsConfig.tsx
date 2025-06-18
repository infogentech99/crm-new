import { FlattenedProject } from '@customTypes/index';
import React from 'react';

export const manageProjectsConfig = (
  currentPage: number,
  limit: number
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: FlattenedProject, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'title', label: 'PROJECT NAME' },
    { key: 'leadName', label: 'LEAD NAME' },
    { key: 'industry', label: 'INDUSTRY' },
    { key: 'status', label: 'STATUS' },
  ];

  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Manage Projects',
    showCreateProjectButton: true,
   
    tableColumns: filteredColumns,
  };
};
