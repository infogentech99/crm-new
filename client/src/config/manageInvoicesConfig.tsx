import { Invoice } from '@customTypes/index';
import dayjs from 'dayjs';
import { Eye, Trash2, Pencil, CreditCard } from 'lucide-react'; 
import React from 'react';
import { DataTableProps } from '@components/Common/DataTable';

export const manageInvoicesConfig = (
  handleViewInvoice: (invoice: Invoice) => void,
  handleEditInvoice: (invoice: Invoice) => void,
  handleDeleteInvoice: (invoice: Invoice) => void,
  handleOpenTransactionModal: (invoice: Invoice) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns: DataTableProps<Invoice>['columns'] = [ 
    { key: '_id', label: 'S.NO', render: (item: Invoice, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'issueDate', label: 'CREATED DATE', render: (item: Invoice) => <span>{dayjs(item.createdAt).format('DD/MM/YYYY hh:mm A')}</span> },
     {
          key: 'updatedDate',
          label: 'UPDATED DATE',
          render: (item: Invoice) => (
            <span>{item.updatedAt ? dayjs(item.updatedAt).format('DD/MM/YYYY hh:mm A') : 'N/A'}</span>
          ),
        },
    { key: 'clientName', label: 'COMPANY', render: (item: Invoice) => <span>{item.user?.name || item.clientName || 'N/A'}</span> },
    { key: 'clientPhone', label: 'CONTACT', render: (item: Invoice) => <span>{item.user?.phoneNumber || item.clientPhone || 'N/A'}</span> }, 
    { key: 'invoiceNumber', label: 'INVOICE NO', render: (item: Invoice) => <span>{item._id}</span> },
    { key: 'totalAmount', label: 'TOTAL', render: (item: Invoice) => <span>₹{item.totals?.total?.toFixed(2) || '0.00'} Rs</span> }, 
    { key: 'dueAmount', label: 'DUE AMOUNT', render: (item: Invoice) => <span>₹{((item.totals?.total || 0) - (item.paidAmount || 0)).toFixed(2)} Rs</span> },
    {
      key: 'projectId',
      label: 'PROJECT TITLE',
      render: (item: Invoice) => (
        <span>
          {item.user?.projects && item.user.projects.length > 0
            ? item.user.projects.map((project) => project.title).join(', ')
            : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      align: 'right',
      render: (item: Invoice) => (
        <div className="flex items-center justify-end space-x-2">
          <button className="text-yellow-500 hover:text-yellow-700 flex items-center cursor-pointer" onClick={() => handleOpenTransactionModal(item)}>
            <CreditCard className="h-4 w-4" />
          </button>
          <button className="text-gray-500 hover:text-gray-700 flex items-center cursor-pointer" onClick={() => handleViewInvoice(item)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-blue-500 hover:text-blue-700 flex items-center cursor-pointer" onClick={() => handleEditInvoice(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center cursor-pointer" onClick={() => handleDeleteInvoice(item)}>
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
