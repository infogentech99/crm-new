import { Meeting } from '@customTypes/index';
import {Eye, Trash2, Pencil } from 'lucide-react';
import React from 'react';

export const manageMeetingsConfig = (
  handleViewMeeting: (meeting: Meeting) => void,
  handleEditMeeting: (meeting: Meeting) => void,
  handleDeleteMeeting: (meeting: Meeting) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: Meeting, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'title', label: 'TITLE' },
    { key: 'date', label: 'DATE & TIME', render: (item: Meeting) => <span>{new Date(item.date).toLocaleString()}</span> },
    { key: 'duration', label: 'DURATION' },
    {
      key: 'status',
      label: 'STATUS',
      render: (item: Meeting) => (
        <div className="flex items-center">
          <span>{item.status}</span>
          <span
            className={`ml-2 w-2 h-2 rounded-full ${
              item.status === 'Completed' ? 'bg-green-500' : item.status === 'Scheduled' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          ></span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (item: Meeting) => (
        <div className="flex items-center space-x-2">
           <button className="text-gray-500 hover:text-gray-700 flex items-center" onClick={() => handleViewMeeting(item)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-blue-500 hover:text-blue-700 flex items-center" onClick={() => handleEditMeeting(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center" onClick={() => handleDeleteMeeting(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Meetings',
    showAddMeetingButton: true,
    addMeetingButtonAction: () => alert('Add Meeting functionality is under development.'),
    tableColumns: filteredColumns,
  };
};
