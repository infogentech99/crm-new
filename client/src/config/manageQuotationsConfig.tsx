import dayjs from 'dayjs';
import { Quotation } from '@customTypes/index';
import { Eye, Trash2, Pencil } from 'lucide-react';
import React from 'react';
import { DataTableProps } from '@components/Common/DataTable';

export const manageQuotationsConfig = (
  handleViewQuotation: (quotation: Quotation) => void,
  handleEditQuotation: (quotation: Quotation) => void,
  handleDeleteQuotation: (quotation: Quotation) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns: DataTableProps<Quotation>['columns'] = [
    {
      key: '_id',
      label: 'S.NO',
      render: (item: Quotation, index?: number) => (
        <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span>
      ),
    },
    {
      key: 'quotationNumber',
      label: 'QUOTATION NO.',
      render: (item: Quotation) => <span>{item._id}</span>, // use _id directly
    },
    {
      key: 'clientName',
      label: 'CLIENT NAME',
      render: (item: Quotation) => <span>{item.user?.name || 'N/A'}</span>,
    },
    {
      key: 'company', label: 'COMPANY',
      render: (item: Quotation) => <span>{item.user?.company || 'N/A'}</span>,
    },
    {
      key: 'totalAmount',
      label: 'TOTAL AMOUNT',
      render: (item: Quotation) => (
        <span>₹{Number(item.totals?.total || 0).toFixed(2)}</span>
      ),
    },
    {
      key: 'issueDate',
      label: 'ISSUE DATE',
      render: (item: Quotation) => (
        <span>{item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY hh:mm A') : 'N/A'}</span>
      ),
    },
    {
      key: 'validUntil',
      label: 'UPDATE DATE',
      render: (item: Quotation) => (
        <span>{item.updatedAt ? dayjs(item.updatedAt).format('DD/MM/YYYY hh:mm A') : 'N/A'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      align: 'right',
      render: (item: Quotation) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            className="text-gray-500 hover:text-gray-700 flex items-center cursor-pointer"
            onClick={() => handleViewQuotation(item)}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="text-blue-500 hover:text-blue-700 flex items-center cursor-pointer"
            onClick={() => handleEditQuotation(item)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="text-red-500 hover:text-red-700 flex items-center cursor-pointer"
            onClick={() => handleDeleteQuotation(item)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return {
    pageTitle: 'Manage Quotations',
    showCreateQuotationButton: true,
    tableColumns: baseColumns,
  };
};
