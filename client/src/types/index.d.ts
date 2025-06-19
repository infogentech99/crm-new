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
  _id: string;
  id?: number;
  type: "Lead" | "Meeting" | "Task";
  description: string;
  date: string;

  name?: string;
  company?: string;

  title?: string;
  time?: string;
  participants?: string[];
 
  assignee?: string;
  status?: string;
}


export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdBy: string | User;
  companyName?: string; 
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
  notes?: {
    message?: string;
    createdAt?: string;
    createdBy?: string;
  }[];
  status?: 'pending_approval' | 'denied' | 'approved' | 'quotation_submitted' | 'quotation_rejected' | 'quotation_approved' | 'invoice_issued' | 'invoice_accepted' | 'completed' | 'processing_payments' | 'new' | 'contacted' | 'qualified' | 'lost';
  gstin?: string;
  bestTimeToCall?: string;
  callResponse?: 'Picked' | 'Not Response' | 'Talk to later';
  denialReason?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
   projects: {
    _id: string;
    title: string;
    status: string;
  }[];
}

export interface Task {
  _id: string;
  title: string;
  dueDate: string; 
  priority: 'High' | 'Medium' | 'Low';
  assignee?: string | User; 
  status: 'Pending' | 'Completed' | 'In Progress';
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  method: string
  amount: number;
  transactionId: string
  invoiceId: string,
  leadId: string,
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
  user: User;
  invoice: Invoice,
  transactionDate: string
}

export interface Meeting {
  _id: string;
  title: string;
  date: string; 
  duration: string; 
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  participants?: (string | User | Contact | Lead)[];
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  _id: string;
  billNumber: string;
  vendorName: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Due' | 'Overdue';
  issueDate: string;
  dueDate: string;
  items?: QuotationItem[];
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
  description: string;
  hsnCode: string;
}

export interface Deal {
  _id: string;
  dealName: string;
  amount: number;
  stage: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  closeDate: string; 
  contactPerson?: string | Contact | Lead; 
  company?: string;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string; 
  items: QuotationItem[]; 
  totalAmount: number;
  paidAmount?: number; 
  status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  issueDate: string; 
  dueDate: string; 
  relatedQuotation?: string; 
  createdBy: string | User; 
  createdAt: string;
  updatedAt: string;

  user: User; 
  totals: {
    taxable: number;
    igst: number;
    total: number;
  };
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}


export interface FlattenedProject {
  _id: string;
  title: string;
  status: string;
  leadName: string;
  industry?: 'IT' | 'Retail' | 'Manufacturing' | 'Other' | undefined;
}

export interface QuotationItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  price: number;
  hsn: string
}
export interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  price: number;
  hsn: string
}

export interface Quotation {
  data: any;
  _id: string;
  quotationNumber: string;
  clientName: string;
  clientEmail: string;
  items: QuotationItem[];
  totalAmount: number;
  issueDate: string;
  validUntil: string; 
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
  user: Lead;
  totals: QuotationItem;
}

export type LeadStatus =
  | 'pending_approval'
  | 'denied'
  | 'approved'
  | 'quotation_submitted'
  | 'quotation_rejected'
  | 'quotation_approved'
  | 'invoice_issued'
  | 'invoice_accepted'
  | 'processing_payments'
  | 'completed';

export interface FormData {
  name: string;
  phoneNumber: string;
  email: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  source: 'Website' | 'Referral' | 'LinkedIn' | 'Cold Call';
  industry: 'IT' | 'Retail' | 'Manufacturing' | 'Other';
  status: 'pending_approval' | 'denied' | 'approved' | 'quotation_submitted' | 'quotation_rejected' | 'quotation_approved' | 'invoice_issued' | 'invoice_accepted' | 'completed' | 'processing_payments' | 'new' | 'contacted' | 'qualified' | 'lost';
  callResponse: 'Picked' | 'Not Response' | 'Talk to later';
  description?: string;
  remark?: string;
  position?: string;
  website?: string;
  createdBy?: string | User;
  projects?: {
    _id: string;
    title: string;
    status: string;
  }[];
}
