import { Lead } from '@customTypes/index';

const API_URL = '/api/leads';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getLeads = async (
  page: number = 1,
  limit: number = 10,
  search: string = '',
  status: string = ''
): Promise<{ leads: Lead[]; totalPages: number; currentPage: number; totalLeads: number }> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${search}`;
  }
  if (status) {
    url += `&status=${status}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch leads');
  }
  return response.json();
};

export const getLeadById = async (id: string): Promise<Lead> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch lead with ID ${id}`);
  }
  return response.json();
};

export const createLead = async (leadData: Omit<Lead, '_id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(leadData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create lead');
  }
  return response.json();
};

export const updateLead = async (id: string, leadData: Partial<Lead>): Promise<Lead> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(leadData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update lead with ID ${id}`);
  }
  return response.json();
};

export const deleteLead = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete lead with ID ${id}`);
  }
  return response.json();
};
