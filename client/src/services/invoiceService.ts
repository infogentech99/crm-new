import { Invoice, InvoiceItem, InvoiceResponse } from '@customTypes/index';

const API_URL = '/api/invoice'; 

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};


export interface PaginatedInvoices {
  invoices: Invoice[];
  totalPages: number;
  currentPage: number;
  totalInvoices: number;
}

export const getInvoices = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<PaginatedInvoices> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}&populate=projects`;
  if (search) {
    url += `&search=${search}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch invoices');
  }
  return response.json();
};

export const getInvoiceById = async (id: string): Promise<InvoiceResponse> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch invoice with ID ${id}`);
  }
  return response.json();
};

export const createInvoice = async (
  invoiceData: {
    _id: string;
    gstin: string;
    items: InvoiceItem[];
    projectId: string | null;
    totals: {
      taxable: number;
      igst: number;
      total: number;
    };
  }
): Promise<{ message: string; data: Invoice }> => {
  const response = await fetch(`${API_URL}/genrate`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoiceData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create invoice');
  }

  return response.json();
};



export const updateInvoice = async (id: string, invoiceData: Partial<Invoice>): Promise<Invoice> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(invoiceData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update invoice with ID ${id}`);
  }
  return response.json();
};

export const deleteInvoice = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete invoice with ID ${id}`);
  }
  return response.json();
};


// export const getOrCreateFinalInvoice = async (
//   leadId: string
// ): Promise<InvoiceResponse> => {
//   const res = await fetch(`${API_URL}/final/${leadId}`, {
//     method: 'POST',
//     headers: getAuthHeaders(),
//   });
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(
//       err.message || `Failed to get/create final invoice for project ${leadId}`
//     );
//   }
//   return res.json();
// };

// client/services/invoiceService.ts
export const getOrCreateFinalInvoice = async (
  invoiceNumber: string
): Promise<InvoiceResponse> => {
  const res = await fetch(
    `${API_URL}/final-invoice/${invoiceNumber}`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ||
        `Failed to get/create final invoice for invoice #${invoiceNumber}`
    );
  }
  return res.json();
};


export const getInvoiceByNumber = async (
  invoiceNumber: string
): Promise<InvoiceResponse> => {
  const res = await fetch(`${API_URL}/${invoiceNumber}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch invoice ${invoiceNumber}`);
  }
  return res.json();
};