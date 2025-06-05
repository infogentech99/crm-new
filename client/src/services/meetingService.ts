import { Meeting } from '@customTypes/index';

const API_URL = '/api/meetings'; // Assuming a /api/meetings endpoint

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getMeetings = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<{ meetings: Meeting[]; totalPages: number; currentPage: number; totalMeetings: number }> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${search}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch meetings');
  }
  return response.json();
};

export const getMeetingById = async (id: string): Promise<Meeting> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch meeting with ID ${id}`);
  }
  return response.json();
};

export const createMeeting = async (meetingData: Omit<Meeting, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Meeting> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(meetingData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create meeting');
  }
  return response.json();
};

export const updateMeeting = async (id: string, meetingData: Partial<Meeting>): Promise<Meeting> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(meetingData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update meeting with ID ${id}`);
  }
  return response.json();
};

export const deleteMeeting = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete meeting with ID ${id}`);
  }
  return response.json();
};
