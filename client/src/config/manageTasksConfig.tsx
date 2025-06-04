import { Task } from '@customTypes/index';
import { Trash2, Pencil } from 'lucide-react';
import React from 'react';

export const manageTasksConfig = (
  handleViewTask: (task: Task) => void,
  handleEditTask: (task: Task) => void,
  handleDeleteTask: (task: Task) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns = [
    { key: '_id', label: 'S.NO', render: (item: Task, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'title', label: 'TITLE' },
    { key: 'dueDate', label: 'DUE DATE', render: (item: Task) => <span>{new Date(item.dueDate).toLocaleDateString()}</span> },
    { key: 'priority', label: 'PRIORITY' },
    { key: 'assignee', label: 'ASSIGNEE', render: (item: Task) => <span>{typeof item.assignee === 'object' ? item.assignee.name : item.assignee || 'N/A'}</span> },
    {
      key: 'status',
      label: 'STATUS',
      render: (item: Task) => (
        <div className="flex items-center">
          <span>{item.status}</span>
          <span
            className={`ml-2 w-2 h-2 rounded-full ${
              item.status === 'Completed' ? 'bg-green-500' : item.status === 'Pending' ? 'bg-yellow-500' : 'bg-blue-500' // Assuming In Progress is blue
            }`}
          ></span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (item: Task) => (
        <div className="flex items-center space-x-2">
          <button className="text-blue-500 hover:text-blue-700 flex items-center" onClick={() => handleEditTask(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center" onClick={() => handleDeleteTask(item)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredColumns = [...baseColumns];

  return {
    pageTitle: 'Tasks',
    showNewTaskButton: true,
    newTaskButtonAction: () => alert('New Task functionality is under development.'),
    tableColumns: filteredColumns,
  };
};
