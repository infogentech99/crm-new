import { Quotation, QuotationItem } from '@customTypes/index';

const API_URL = '/api/quotations';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
}

export async function getQuotations(
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<{
  quotations: Quotation[];
  totalPages: number;
  currentPage: number;
  totalQuotations: number;
}> {
  let url = `${API_URL}/?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || 'Failed to fetch quotations');
  }
  return res.json();
}

export async function getQuotationById(id: string): Promise<Quotation> {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || `Failed to fetch quotation ${id}`);
  }
  return res.json();
}

interface CreatePayload {
  _id?: string;
  gstin?: string;
  items: QuotationItem[];
  totals: {
    taxable: number;
    igst: number;
    total: number;
  };
}

export async function createQuotation(
  payload: CreatePayload
): Promise<{ message: string; data: Quotation }> {
  const res = await fetch(`${API_URL}/genrate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || 'Failed to create quotation');
  }

  return res.json();
}

interface UpdatePayload {
  gstin?: string;
  items: QuotationItem[];
  totals: {
    taxable: number;
    igst: number;
    total: number;
  };
}

export async function updateQuotation(
  id: string,
  payload: UpdatePayload
): Promise<{ message: string; data: Quotation }> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || 'Failed to update quotation');
  }
  return res.json();
}

export async function deleteQuotation(
  id: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || `Failed to delete quotation ${id}`);
  }
  return res.json();
}
