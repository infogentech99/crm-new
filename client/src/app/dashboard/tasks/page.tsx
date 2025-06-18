"use client";

import React, { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTasks, deleteTask } from '@services/taskService';
import DataTable from '@components/Common/DataTable';
import DashboardLayout from '@components/Dashboard/DashboardLayout';
import NewTaskButton from '@components/Common/NewTaskButton';
import { manageTasksConfig } from '@config/manageTasksConfig';
import Modal from '@components/Common/Modal';
import DeleteModal from '@components/Common/DeleteModal';
import { Task } from '@customTypes/index';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { PaginationComponent } from '@components/ui/pagination';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import TaskForm from '@components/Task/TaskForm';

const ManageTasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const userRole = useSelector((state: RootState) => state.user.role || '');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tasks', page, limit, search],
    queryFn: () => getTasks(page, limit, search),
  });
  const tasks = data?.tasks || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;



  const handleEditTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  }, []);

  const handleDeleteTask = useCallback((task: Task) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  }, []);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    await deleteTask(taskToDelete._id);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    setIsDeleteOpen(false);
    setTaskToDelete(null);
  };

  const config = manageTasksConfig(
    handleEditTask,
    handleDeleteTask,
    userRole,
    currentPage,
    limit
  );
  config.newTaskButtonAction = handleCreateTask;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="p-6 rounded-lg shadow-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">{config.pageTitle}</h1>
          <NewTaskButton onClick={handleCreateTask} />
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search by title or assignee..."
            value={search}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <Select onValueChange={handleLimitChange} value={String(limit)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={config.tableColumns}
          data={tasks}
          isLoading={isLoading}
          error={isError ? error?.message || 'Unknown error' : null}
        />

        <div className="mt-4 flex justify-end">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
          }}
          widthClass="max-w-3xl"
        >
          <TaskForm
            data={selectedTask ?? undefined}
            mode={selectedTask ? 'Edit' : 'Create'}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTask(null);
               queryClient.invalidateQueries({ queryKey: ['tasks'] });
            }}
          />
        </Modal>

        {taskToDelete && (
          <DeleteModal
            isOpen={isDeleteOpen}
            onClose={() => {
              setIsDeleteOpen(false);
              setTaskToDelete(null);
            }}
            onConfirm={confirmDeleteTask}
            itemLabel={taskToDelete.title}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageTasksPage;
