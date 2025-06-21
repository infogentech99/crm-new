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

  // Fetch total contacts
  const totalContactsResponse = await fetch(`${API_URL}/contacts?limit=1`, { headers });
  const totalContactsData = await totalContactsResponse.json();
  const newContacts = totalContactsData?.totalContacts || 0;

  // Fetch open deals summary
  const openDealsSummaryResponse = await fetch(`${API_URL}/deals/summary/open-deals`, { headers });
  const openDealsSummaryData = await openDealsSummaryResponse.json();
  const openDeals = openDealsSummaryData?.totalOpenDealsValue.toFixed(2) || "0.00";

  // Fetch tasks due summary
  const tasksDueSummaryResponse = await fetch(`${API_URL}/tasks/summary/due`, { headers });
  const tasksDueSummaryData = await tasksDueSummaryResponse.json();
  const tasksDue = tasksDueSummaryData?.totalTasksDue || 0;

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

  // Fetch lead status summary
  const leadStatusSummaryResponse = await fetch(`${API_URL}/leads/summary/status`, { headers });
  const leadStatusSummaryData = await leadStatusSummaryResponse.json();

  // Fetch lead source summary
  const leadSourceSummaryResponse = await fetch(`${API_URL}/leads/summary/source`, { headers });
  const leadSourceSummaryData = await leadSourceSummaryResponse.json();

  // Fetch monthly revenue summary
  const monthlyRevenueResponse = await fetch(`${API_URL}/invoice/summary/monthly-revenue`, { headers });
  const monthlyRevenueData = await monthlyRevenueResponse.json();

  // Fetch task status summary
  const taskStatusSummaryResponse = await fetch(`${API_URL}/tasks/summary/status`, { headers });
  const taskStatusSummaryData = await taskStatusSummaryResponse.json();

  // Fetch pending invoice amount summary
  console.log('Fetching Pending Invoice Amount...');
  const pendingInvoiceAmountResponse = await fetch(`${API_URL}/invoice/summary/pending-amount`, { headers });
  const pendingInvoiceAmountData = await pendingInvoiceAmountResponse.json();
  console.log('Pending Invoice Amount Data:', pendingInvoiceAmountData);
  const pendingAmount = pendingInvoiceAmountData?.totalPendingAmount.toFixed(2) || "0.00";

  return {
    totalLeads,
    newContacts,
    openDeals,
    tasksDue,
    approvedQuotations,
    approvedInvoices,
    lostLeads,
    pendingAmount,
    leadStatusSummary: leadStatusSummaryData,
    leadSourceSummary: leadSourceSummaryData,
    monthlyRevenue: monthlyRevenueData,
    taskStatusSummary: taskStatusSummaryData,
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
      description: `New lead: ${lead.name} from ${lead.companyName}`,
      date: new Date(lead.createdAt).toLocaleDateString(),
    }));
  }

  return [];
};
