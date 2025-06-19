import { Deal } from '@customTypes/index';
import { Eye, Trash2, Pencil } from 'lucide-react';
import React from 'react';
import { DataTableProps } from '@components/Common/DataTable'; // Import DataTableProps

export const manageDealsConfig = (
  handleViewDeal: (deal: Deal) => void,
  handleEditDeal: (deal: Deal) => void,
  handleDeleteDeal: (deal: Deal) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns: DataTableProps<Deal>['columns'] = [ // Explicitly type baseColumns
    { key: '_id', label: 'S.NO', render: (item: Deal, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'dealName', label: 'DEAL NAME' },
    { key: 'amount', label: 'AMOUNT', render: (item: Deal) => <span>₹{item.amount.toFixed(2)}</span> },
    { key: 'stage', label: 'STAGE' },
    { key: 'closeDate', label: 'CLOSE DATE', render: (item: Deal) => <span>{new Date(item.closeDate).toLocaleDateString()}</span> },
    { key: 'company', label: 'COMPANY' },
    { key: 'contactPerson', label: 'CONTACT PERSON', render: (item: Deal) => <span>{typeof item.contactPerson === 'object' ? item.contactPerson.name : item.contactPerson || 'N/A'}</span> },
    {
      key: 'actions',
      label: 'ACTIONS',
      align: 'right',
      render: (item: Deal) => (
        <div className="flex items-center justify-end space-x-2">
          <button className="text-gray-500 hover:text-gray-700 flex items-center" onClick={() => handleViewDeal(item)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-blue-500 hover:text-blue-700 flex items-center" onClick={() => handleEditDeal(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center" onClick={() => handleDeleteDeal(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Manage Deals',
    showCreateDealButton: true,
    createDealButtonAction: () => alert('Create Deal functionality is under development.'),
    tableColumns: filteredColumns,
  };
};
