import { Lead } from '@customTypes/index';

const API_URL = '/api/leads';

export const getLeads = async (): Promise<Lead[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch leads');
  }
  return response.json();
};

export const getLeadById = async (id: string): Promise<Lead> => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch lead with ID ${id}`);
  }
  return response.json();
};

export const createLead = async (leadData: Omit<Lead, '_id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Content-Type': 'application/json',
    },
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
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete lead with ID ${id}`);
  }
  return response.json();
};
