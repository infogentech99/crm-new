import { Task, User } from '@customTypes/index';
import BadgeDot from '@components/BadgeDot';
import { Trash2, Pencil } from 'lucide-react';
import React from 'react';
import { DataTableProps } from '@components/Common/DataTable';

export const manageTasksConfig = (
  handleEditTask: (task: Task) => void,
  handleDeleteTask: (task: Task) => void,
  userRole: string,
  currentPage: number,
  limit: number
) => {
  const baseColumns: DataTableProps<Task>['columns'] = [
    { key: '_id', label: 'S.NO', render: (item: Task, index?: number) => <span>{index !== undefined ? (currentPage - 1) * limit + index + 1 : ''}</span> },
    { key: 'title', label: 'TITLE' },
    { key: 'createdBy', label: 'Task Created By', render: (item: Task) => <span>{typeof item.createdBy === 'object' && item.createdBy !== null ? item.createdBy.name : item.createdBy || 'N/A'}</span> },
    { key: 'dueDate', label: 'DUE DATE', render: (item: Task) => <span>{new Date(item.dueDate).toLocaleDateString()}</span> },
    { key: 'priority', label: 'PRIORITY' },
    {
      key: 'assignee',
      label: 'ASSIGNEE',
      render: (item: Task) => {
        const assignee = item.assignee;

        if (!assignee) {
          return <span>N/A</span>;
        }

        if (Array.isArray(assignee)) {
          if (assignee.length === 0) {
            return <span>N/A</span>;
          }
          if (typeof assignee[0] === 'object' && assignee[0] !== null && 'name' in assignee[0]) {
            return <span>{(assignee as User[]).map((user: User) => user.name).join(', ')}</span>;
          } else {
            return <span>{(assignee as string[]).join(', ')}</span>;
          }
        } else if (typeof assignee === 'object' && assignee !== null && 'name' in assignee) {
          return <span>{(assignee as User).name}</span>;
        } else {       
          return <span>{assignee}</span>;
        }
      }
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (item: Task) => <BadgeDot label={item.status} type="status" />,
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      align: 'right',
      render: (item: Task) => (
        <div className="flex items-center justify-end space-x-2">
          <button className="text-blue-500 hover:text-blue-700 flex items-center cursor-pointer" onClick={() => handleEditTask(item)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center cursor-pointer" onClick={() => handleDeleteTask(item)}>
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
