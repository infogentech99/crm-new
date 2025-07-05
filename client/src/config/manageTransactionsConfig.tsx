import { Transaction } from '@customTypes/index';
import { Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import React from 'react';
import { DataTableProps } from '@components/Common/DataTable'; // Import DataTableProps

export const manageTransactionsConfig = (
  handleEditTransaction: (transaction: Transaction) => void,
  handleDeleteTransaction: (transaction: Transaction) => void,
  currentPage: number,
  limit: number,
  userRole:string,
) => {
  const baseColumns: DataTableProps<Transaction>['columns'] = [
    {
      key: '_id',
      label: 'S.NO',
      render: (_: Transaction, index?: number) => (
        <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span>
      ),
    },
    {
      key: 'user.name',
      label: 'TRANSACTION BY',
      render: (item: Transaction) => <span>{item.user?.name || 'N/A'}</span>,
    },
    {
      key: 'invoice._id',
      label: 'INVOICE ID',
      render: (item: Transaction) => <span>{item.invoice?._id || 'N/A'}</span>,
    },
    {
      key: 'projectTitle',
      label: 'PROJECT TITLE',
      render: (item: Transaction) => <span>{item.projectTitle || 'N/A'}</span>,
    },
    {
      key: 'transactionId',
      label: 'TRANSACTION ID',
    },
    {
      key: 'method',
      label: 'METHOD',
    },
    {
      key: 'amount',
      label: 'AMOUNT',
      render: (item: Transaction) => <span>₹{item.amount.toFixed(2)}</span>,
    },
    {
      key: 'transactionDate',
      label: 'DATE',
      render: (item: Transaction) => <span>{dayjs(item.transactionDate).format('DD/MM/YYYY')}</span>,
    },
    ...(userRole !== 'accounts'
      ? [
          {
            key: 'actions',
            label: 'ACTIONS',
            align: 'right',
            render: (item: Transaction) => (
              <div className="flex items-center justify-end space-x-2">
                <button
                  className="text-blue-500 hover:text-gray-700 flex items-center cursor-pointer"
                  onClick={() => handleEditTransaction(item)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700 flex items-center cursor-pointer"
                  onClick={() => handleDeleteTransaction(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          } as DataTableProps<Transaction>['columns'][number],
        ]
      : []),
  ];

  return {
    pageTitle: 'Manage Transactions',
    showCreateTransactionButton: true,
    tableColumns: baseColumns,
  };
};
