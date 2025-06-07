import { Quotation } from '@customTypes/index';

const API_URL = '/api/quotations';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getQuotations = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<{ quotations: Quotation[]; totalPages: number; currentPage: number; totalQuotations: number }> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${search}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch quotations');
  }
  return response.json();
};

export const getQuotationById = async (id: string): Promise<Quotation> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch quotation with ID ${id}`);
  }
  return response.json();
};

export const createQuotation = async (
  quotationData: Omit<Quotation, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>
): Promise<Quotation> => {
  try {
    const response = await fetch(`${API_URL}/genrate`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quotationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create quotation');
    }

    return response.json();
  } catch (err) {
    console.error('Create Quotation Error:', err);
    throw err;
  }
};


export const updateQuotation = async (id: string, quotationData: Partial<Quotation>): Promise<Quotation> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(quotationData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update quotation with ID ${id}`);
  }
  return response.json();
};

export const deleteQuotation = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete quotation with ID ${id}`);
  }
  return response.json();
};
