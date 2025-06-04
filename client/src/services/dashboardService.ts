import { DashboardSummary, RecentActivity, Lead } from '@customTypes/index';

const API_URL = '/api'; // Base URL for all API endpoints

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const headers = getAuthHeaders();

  // Fetch total leads
  const totalLeadsResponse = await fetch(`${API_URL}/leads?limit=1`, { headers });
  const totalLeadsData = await totalLeadsResponse.json();
  const totalLeads = totalLeadsData?.totalLeads || 0;

  // Fetch approved quotations (leads with status 'quotation_approved')
  const approvedQuotationsResponse = await fetch(`${API_URL}/leads?status=quotation_approved&limit=1`, { headers });
  const approvedQuotationsData = await approvedQuotationsResponse.json();
  const approvedQuotations = approvedQuotationsData?.totalLeads || 0;

  // Fetch approved invoices (leads with status 'invoice_accepted')
  const approvedInvoicesResponse = await fetch(`${API_URL}/leads?status=invoice_accepted&limit=1`, { headers });
  const approvedInvoicesData = await approvedInvoicesResponse.json();
  const approvedInvoices = approvedInvoicesData?.totalLeads || 0;

  // Fetch lost leads (leads with status 'lost')
  const lostLeadsResponse = await fetch(`${API_URL}/leads?status=lost&limit=1`, { headers });
  const lostLeadsData = await lostLeadsResponse.json();
  const lostLeads = lostLeadsData?.totalLeads || 0;

  return {
    totalLeads,
    newContacts: 0, // No backend endpoint found for this, setting to 0
    openDeals: "0.00", // No backend endpoint found for this, setting to "0.00"
    tasksDue: 0, // No backend endpoint found for this, setting to 0
    approvedQuotations,
    approvedInvoices,
    lostLeads,
  };
};

export const fetchRecentActivities = async (): Promise<RecentActivity[]> => {
  const headers = getAuthHeaders();

  // Fetch recent leads as recent activities
  const leadsResponse = await fetch(`${API_URL}/leads?limit=5&sort=-createdAt`, { headers });
  const leadsData = await leadsResponse.json();

  if (leadsResponse.ok && leadsData && Array.isArray(leadsData.leads)) {
    return leadsData.leads.map((lead: Lead) => ({
      id: lead._id,
      type: 'Lead',
      description: `New lead: ${lead.name} from ${lead.company}`,
      date: new Date(lead.createdAt).toLocaleDateString(),
    }));
  }

  return [];
};
