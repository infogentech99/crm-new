export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface DashboardSummary {
  totalLeads: number;
  newContacts: number;
  openDeals: string; 
  tasksDue: number;
  approvedQuotations: number;
  approvedInvoices: number;
  lostLeads: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  date: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  // Add other user properties if needed from the backend response
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdBy: string | User; // Can be user ID string or populated User object
  company?: string;
  jobTitle?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  linkedIn?: string;
  source?: 'Website' | 'Referral' | 'LinkedIn' | 'Cold Call';
  industry?: 'IT' | 'Retail' | 'Manufacturing' | 'Other';
  notes?: string;
  status?: 'pending_approval' | 'denied' | 'approved' | 'quotation_submitted' | 'quotation_rejected' | 'quotation_approved' | 'invoice_issued' | 'invoice_accepted' | 'completed' | 'processing_payments' | 'new' | 'contacted' | 'qualified' | 'lost';
  gstin?: string;
  bestTimeToCall?: string;
  callResponse?: 'Picked' | 'Not Response' | 'Talk to later';
  denialReason?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}
