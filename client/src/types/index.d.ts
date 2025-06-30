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
  openDeals: string;
  tasksDue: number;
  approvedQuotations: number;
  approvedInvoices: number;
  lostLeads: number;
  pendingAmount: string;
  totalInvoicesAmount: string;
  totalPaidInvoicesAmount: string;
  leadStatusSummary: { [key: string]: number };
  leadSourceSummary: { [key: string]: number };
  monthlyRevenue: { name: string; revenue: number }[];
  taskStatusSummary: { [key: string]: number };
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
  address?: string;
  city?: string;
  zipCode?: string;
  gstin?: string;
  phoneNumber?: string;
  projects?: { _id: string; title: string; status: string }[];
  createdAt: string;
  companyName:string; // Added createdAt
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string; // Added
  position?: string; // Added
  company?: string; // Added (assuming this is the field used in the UI)
  phoneNumber?: string;
  createdBy: string | User; 
  projectId: string; // 
  companyName?: string; 
  jobTitle?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  linkedIn?: string;
   description?: string;
  source?: 'Website' | 'Referral' | 'LinkedIn' | 'Cold Call';
  industry?: 'IT' | 'Retail' | 'Manufacturing' | 'Other';
  notes?: Note[]; // Changed to use Note interface
  status?: LeadStatus; // Changed to use LeadStatus type
   
  gstin?: string;
  bestTimeToCall?: string;
  callResponse?: 'Picked' | 'Not Response' | 'Talk to later';
  denialReason?: string;
  remark?: string;
  createdAt: string;

  updatedAt: string;
  projects: Project[]; // Changed to use Project interface
  transactions?: Transaction[]; // Added
}

export interface Project { // New interface for Project
  _id: string;
  title: string;
  status: string;
}

export interface Note { // New interface for Note
  message: string; // Made required
  createdAt?: string;
  createdBy?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string; 
  priority: 'High' | 'Medium' | 'Low';
  assignee?: string[] | User[]; 
  status: 'Pending' | 'Completed' | 'In Progress';
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
  repeat?: 'None' | 'Daily' | 'Weekly' | 'Monthly'; // Added repeat property
}

export interface Transaction {
  _id: string;
  method: string
  amount: number;
  transactionId: string
  invoiceId: string;
  leadId: string;
  projectId?: string; // Added projectId
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
  user: User;
  invoice: Invoice;
  transactionDate: string;
  date: string;
}

export interface Meeting {
  _id: string;
  title: string;
  date: string; 
  duration: number; // Changed to number
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  participants?: (string | User | Contact | Lead)[];
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
  platform?: string; // Added platform
  meetlink?: string; // Added meetlink
  description?: string; // Added description
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

export interface PaymentDetails {
  transactionId: string;
  amountPaid: number;
  cardType: string;
  status: string;
  bankTransactionId: string;
  transactionDate: string;
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
  issueDate?: string; 
  dueDate: string; 
  relatedQuotation?: string; 
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  date?: string; 
  payment?: PaymentDetails; 
  user: User;
  projectId: string;
  totals: {
    taxable: number;
    igst: number;
    total: number;
  };
}


export interface InvoiceResponse {
  _id: string;
  data: Invoice;
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

export interface CustomerData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  email: string;
  phone: string;
  gstn: string;
}

export interface QuotationItem {
  name?: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
  total?: number;
  price: number;
  hsn: string
}

export interface InvoiceItem {
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
  price?: number;
  hsn?: string
}

export interface Quotation {
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
  totals: {
    taxable: number;
    igst: number;
    total: number;
  };
  date?: string; // Added date as it's used in page.tsx
}
export type LeadStatus =
  | 'new'
  | 'quotation_submitted'
  | 'quotation_approved'
  | 'invoice_issued'
  | 'invoice_accepted'
  | 'processing_payments'
  | 'payments_complete'
  | 'final_invoice'
  | 'completed'
  | 'denied';

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
  status: LeadStatus;
  callResponse: 'Picked' | 'Not Response' | 'Talk to later';
  description?: string;
  remark?: string;
  position?: string;
  website?: string;
  linkedIn?: string;
  createdBy: string | User;
  projects: {
    _id: string;
    title: string;
    status: string;
  }[];
}

export interface MeetingEmailData {
  title: string;
  date: string;
  duration: number;
  platform: string;
  meetlink: string;
  description: string;
  participants: string[];
}

export interface MeetingSummary {
  totalMeetings: number;
  upcomingMeetings: number;
  completedMeetings: number;
  cancelledMeetings: number;
}

declare module 'number-to-words' {
  export function toWords(num: number): string;
}