import { Invoice } from '@customTypes/index';
import { Eye, Trash2, Pencil } from 'lucide-react';
import React from 'react';

export const manageInvoicesConfig = (
  handleViewInvoice: (invoice: Invoice) => void,
  handleEditInvoice: (invoice: Invoice) => void,
  handleDeleteInvoice: (invoice: Invoice) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: Invoice, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'invoiceNumber', label: 'INVOICE NO.' },
    { key: 'clientName', label: 'CLIENT NAME' },
    { key: 'totalAmount', label: 'TOTAL AMOUNT', render: (item: Invoice) => <span>${item.totalAmount.toFixed(2)}</span> },
    { key: 'status', label: 'STATUS' },
    { key: 'issueDate', label: 'ISSUE DATE', render: (item: Invoice) => <span>{new Date(item.issueDate).toLocaleDateString()}</span> },
    { key: 'dueDate', label: 'DUE DATE', render: (item: Invoice) => <span>{new Date(item.dueDate).toLocaleDateString()}</span> },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (item: Invoice) => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700 flex items-center" onClick={() => handleViewInvoice(item)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-blue-500 hover:text-blue-700 flex items-center" onClick={() => handleEditInvoice(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center" onClick={() => handleDeleteInvoice(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Manage Invoices',
    showCreateInvoiceButton: true,
    createInvoiceButtonAction: () => alert('Create Invoice functionality is under development.'),
    tableColumns: filteredColumns,
  };
};
