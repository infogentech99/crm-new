import { User } from '@customTypes/index'; // Assuming User type will be defined

const API_URL = '/api/users'; // Base URL for user endpoints

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

interface GetUsersResponse {
  users: User[];
  total: number;
  pages: number;
}

export const fetchUsers = async (page: number = 1, limit: number = 10, roleFilter?: string): Promise<GetUsersResponse> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (roleFilter) {
    url += `&roleFilter=${roleFilter}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch users');
  }

  return response.json();
};
