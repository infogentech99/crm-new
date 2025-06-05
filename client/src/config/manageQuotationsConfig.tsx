import { Quotation } from '@customTypes/index';
import { Eye, Trash2, Pencil } from 'lucide-react';
import React from 'react';

export const manageQuotationsConfig = (
  handleViewQuotation: (quotation: Quotation) => void,
  handleEditQuotation: (quotation: Quotation) => void,
  handleDeleteQuotation: (quotation: Quotation) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: Quotation, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'quotationNumber', label: 'QUOTATION NO.' },
    { key: 'clientName', label: 'CLIENT NAME' },
    { key: 'totalAmount', label: 'TOTAL AMOUNT', render: (item: Quotation) => <span>${item.totalAmount.toFixed(2)}</span> },
    { key: 'status', label: 'STATUS' },
    { key: 'issueDate', label: 'ISSUE DATE', render: (item: Quotation) => <span>{new Date(item.issueDate).toLocaleDateString()}</span> },
    { key: 'validUntil', label: 'VALID UNTIL', render: (item: Quotation) => <span>{new Date(item.validUntil).toLocaleDateString()}</span> },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (item: Quotation) => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700 flex items-center" onClick={() => handleViewQuotation(item)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-blue-500 hover:text-blue-700 flex items-center" onClick={() => handleEditQuotation(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center" onClick={() => handleDeleteQuotation(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Manage Quotations',
    showCreateQuotationButton: true,
    createQuotationButtonAction: () => alert('Create Quotation functionality is under development.'),
    tableColumns: filteredColumns,
  };
};
