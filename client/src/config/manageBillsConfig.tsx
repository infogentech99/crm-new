import { Bill } from '@customTypes/index';
import { Eye, Trash2, Pencil } from 'lucide-react';
import React from 'react';

export const manageBillsConfig = (
  handleViewBill: (bill: Bill) => void,
  handleEditBill: (bill: Bill) => void,
  handleDeleteBill: (bill: Bill) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: Bill, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'billNumber', label: 'BILL NO.' },
    { key: 'vendorName', label: 'VENDOR NAME' },
    { key: 'amount', label: 'AMOUNT', render: (item: Bill) => <span>${item.amount.toFixed(2)}</span> },
    { key: 'status', label: 'STATUS' },
    { key: 'issueDate', label: 'ISSUE DATE', render: (item: Bill) => <span>{new Date(item.issueDate).toLocaleDateString()}</span> },
    { key: 'dueDate', label: 'DUE DATE', render: (item: Bill) => <span>{new Date(item.dueDate).toLocaleDateString()}</span> },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (item: Bill) => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700 flex items-center" onClick={() => handleViewBill(item)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-blue-500 hover:text-blue-700 flex items-center" onClick={() => handleEditBill(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center" onClick={() => handleDeleteBill(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Manage Bills',
    showCreateBillButton: true,
    createBillButtonAction: () => alert('Create Bill functionality is under development.'),
    tableColumns: filteredColumns,
  };
};
