import { Transaction } from '@customTypes/index';

const API_URL = '/api/transactions'; // Assuming a /api/transactions endpoint

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
export interface TransactionInput {
  amount: number;
  method: string;
  transactionId: string;
  invoiceId: string;
  leadId: string;
  projectId?: string; // Made projectId optional
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  totalTransactions: number;
}
export const getTransactions = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<{ transactions: Transaction[]; totalPages: number; currentPage: number; totalTransactions: number }> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${search}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch transactions');
  }
  return response.json();
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch transaction with ID ${id}`);
  }
  return response.json();
};



export const createTransaction = async (
  transactionData: TransactionInput
): Promise<Transaction> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(transactionData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create transaction');
  }

  return response.json();
};

export const updateTransaction = async (id: string, transactionData: Partial<Transaction>): Promise<Transaction> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(transactionData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update transaction with ID ${id}`);
  }
  return response.json();
};

export const deleteTransaction = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete transaction with ID ${id}`);
  }
  return response.json();
};
export const getTransactionsByInvoiceId = async (
  invoiceId: string
): Promise<Transaction[]> => {
  const response = await fetch(`${API_URL}/${invoiceId}/transactions`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    // try to extract a JSON error, or fallback to text
    const text = await response.text();
    try {
      const err = JSON.parse(text);
      throw new Error(err.error || err.message || "Failed to fetch payments");
    } catch {
      throw new Error(text || "Failed to fetch payments");
    }
  }

  // Response body is JSON: { data: Transaction[] }
  const payload: { data?: Transaction[]; transactions?: Transaction[] } = await response.json();
  return payload.data || payload.transactions || [];
};
