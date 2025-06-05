import { Bill } from '@customTypes/index';

const API_URL = '/api/bills'; // Assuming a /api/bills endpoint based on server/index.js

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getBills = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<{ bills: Bill[]; totalPages: number; currentPage: number; totalBills: number }> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${search}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch bills');
  }
  return response.json();
};

export const getBillById = async (id: string): Promise<Bill> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch bill with ID ${id}`);
  }
  return response.json();
};

export const createBill = async (billData: Omit<Bill, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Bill> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(billData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create bill');
  }
  return response.json();
};

export const updateBill = async (id: string, billData: Partial<Bill>): Promise<Bill> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(billData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update bill with ID ${id}`);
  }
  return response.json();
};

export const deleteBill = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete bill with ID ${id}`);
  }
  return response.json();
};
