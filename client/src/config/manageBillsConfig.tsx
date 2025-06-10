import { Bill } from '@customTypes/index';
import { Trash2, Pencil } from 'lucide-react';
import React from 'react';

export const manageBillsConfig = (
  handleCreateBill: () => void,
  handleEditBill: (bill: Bill) => void,
  handleDeleteBill: (bill: Bill) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: Bill, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
     {
         key: 'description',
         label: 'DESCRIPTION',
         render: (item: Bill) => <span>{item.description}</span>,
       },
       {
         key: 'hsnCode',
         label: 'HSN CODE',
         render: (item: Bill) => <span>{item.hsnCode}</span>,
       },
    { key: 'amount', label: 'AMOUNT', render: (item: Bill) => <span>${item.amount.toFixed(2)}</span> },
   
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (item: Bill) => (
        <div className="flex items-center space-x-2">
        
          <button className="text-blue-500 hover:text-blue-700 flex items-center cursor-pointer" onClick={() => handleEditBill(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center cursor-pointer" onClick={() => handleDeleteBill(item)}>
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
     createBillButtonAction: handleCreateBill,
    tableColumns: filteredColumns,
  };
};
