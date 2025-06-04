import { Transaction } from '@customTypes/index';
import { Eye, Trash2 } from 'lucide-react'; // Only Eye and Trash2 for transactions
import React from 'react';

export const manageTransactionsConfig = (
  handleViewTransaction: (transaction: Transaction) => void,
  handleDeleteTransaction: (transaction: Transaction) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: Transaction, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'type', label: 'TYPE' },
    { key: 'amount', label: 'AMOUNT', render: (item: Transaction) => <span>${item.amount.toFixed(2)}</span> },
    { key: 'date', label: 'DATE', render: (item: Transaction) => <span>{new Date(item.date).toLocaleDateString()}</span> },
    { key: 'description', label: 'DESCRIPTION' },
    { key: 'relatedInvoice', label: 'RELATED INVOICE', render: (item: Transaction) => <span>{item.relatedInvoice || 'N/A'}</span> },
    { key: 'relatedBill', label: 'RELATED BILL', render: (item: Transaction) => <span>{item.relatedBill || 'N/A'}</span> },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (item: Transaction) => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700 flex items-center" onClick={() => handleViewTransaction(item)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center" onClick={() => handleDeleteTransaction(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Manage Transactions',
    showCreateTransactionButton: true,
    createTransactionButtonAction: () => alert('Create Transaction functionality is under development.'),
    tableColumns: filteredColumns,
  };
};
