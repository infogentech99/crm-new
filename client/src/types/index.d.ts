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
  type: "Lead" | "Meeting" | "Task";
  description: string;
  date: string;
  // Lead fields
  name?: string;
  company?: string;
  // Meeting fields
  title?: string;
  time?: string;
  participants?: string[];
  // Task fields
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
  phone: string;
  createdBy: string | User;
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
  dueDate: string; // ISO date string
  priority: 'High' | 'Medium' | 'Low';
  assignee?: string | User; // User ID or populated User object
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
  date: string; // Combined date and time, ISO string
  duration: string; // e.g., "30 Min"
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  participants?: (string | User | Contact | Lead)[]; // Array of IDs or populated objects
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
  closeDate: string; // ISO date string
  contactPerson?: string | Contact | Lead; // Can be Contact/Lead ID or populated object
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
  clientPhone?: string; // Added for contact column
  items: QuotationItem[]; // Reusing QuotationItem for consistency
  totalAmount: number;
  paidAmount?: number; // Added for due amount calculation
  status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  relatedQuotation?: string; // Optional: ID of the related quotation
  createdBy: string | User; // User ID or populated User object
  createdAt: string;
  updatedAt: string;
  // Add the populated user and totals objects
  user: User; // Assuming the populated user will conform to the User interface
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

// Original Project interface (if needed elsewhere, otherwise remove)
// export interface Project {
//   _id: string;
//   name: string;
//   company?: string;
//   industry?: string;
//   createdBy: string | User;
//   createdAt: string;
//   updatedAt: string;
// }

// New interface for flattened project data in DataTable
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
  issueDate: string; // ISO date string
  validUntil: string; // ISO date string
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
  phone: string;
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  source: string;
  industry: string;
  status: string;
  callResponse: string;
  description?: string;
  remark?: string;
  position?: string;
  website?: string;
}
