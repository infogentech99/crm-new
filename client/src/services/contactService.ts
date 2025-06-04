import { Contact } from '@customTypes/index';

const API_URL = '/api/contacts';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getContacts = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<{ contacts: Contact[]; totalPages: number; currentPage: number; totalContacts: number }> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${search}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch contacts');
  }
  return response.json();
};

export const getContactById = async (id: string): Promise<Contact> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch contact with ID ${id}`);
  }
  return response.json();
};

export const createContact = async (contactData: Omit<Contact, '_id' | 'createdAt' | 'updatedAt'>): Promise<Contact> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(contactData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create contact');
  }
  return response.json();
};

export const updateContact = async (id: string, contactData: Partial<Contact>): Promise<Contact> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(contactData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update contact with ID ${id}`);
  }
  return response.json();
};

export const deleteContact = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete contact with ID ${id}`);
  }
  return response.json();
};
