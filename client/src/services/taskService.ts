import { Task } from '@customTypes/index';

const API_URL = '/api/tasks'; // Assuming a /api/tasks endpoint

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getTasks = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<{ tasks: Task[]; totalPages: number; currentPage: number; totalTasks: number }> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${search}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch tasks');
  }
  return response.json();
};

export const getTaskById = async (id: string): Promise<Task> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch task with ID ${id}`);
  }
  return response.json();
};

export const createTask = async (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Task> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create task');
  }
  return response.json();
};

export const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update task with ID ${id}`);
  }
  return response.json();
};

export const deleteTask = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete task with ID ${id}`);
  }
  return response.json();
};
