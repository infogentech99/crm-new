import { Deal } from '@customTypes/index';

const API_URL = '/api/deals'; // Assuming a /api/deals endpoint

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getDeals = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<{ deals: Deal[]; totalPages: number; currentPage: number; totalDeals: number }> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${search}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch deals');
  }
  return response.json();
};

export const getDealById = async (id: string): Promise<Deal> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch deal with ID ${id}`);
  }
  return response.json();
};

export const createDeal = async (dealData: Omit<Deal, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Deal> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dealData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create deal');
  }
  return response.json();
};

export const updateDeal = async (id: string, dealData: Partial<Deal>): Promise<Deal> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(dealData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update deal with ID ${id}`);
  }
  return response.json();
};

export const deleteDeal = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete deal with ID ${id}`);
  }
  return response.json();
};
