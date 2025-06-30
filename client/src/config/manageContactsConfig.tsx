import { DataTableProps } from '@components/Common/DataTable';
import { Contact } from '@customTypes/index';
import React from 'react';

export const manageContactsConfig = (
  currentPage: number,
  limit: number
) => {
  const baseColumns: DataTableProps<Contact>['columns'] = [
    { key: '_id', label: 'S.NO', render: (item: Contact, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'name', label: 'NAME' },
    { key: 'position', label: 'POSITION' },
    { key: 'companyName', label: 'COMPANY' },
    { key: 'industry', label: 'INDUSTRY' },
    { key: 'city', label: 'CITY' },
    { key: 'email', label: 'EMAIL' },
    { key: 'phoneNumber', label: 'PHONE' },

  ];

  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Manage Contacts',
    showCreateContactButton: true,
    tableColumns: filteredColumns,
  };
};
