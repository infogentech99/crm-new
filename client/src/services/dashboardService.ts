import { DashboardSummary, RecentActivity, Lead, MeetingSummary } from '@customTypes/index';


const API_URL = '/api';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const fetchDashboardSummary = async (role: string): Promise<DashboardSummary> => {
  const headers = getAuthHeaders();

  let totalLeads = 0;
  let newContacts = 0;
  let approvedQuotations = 0;
  let approvedInvoices = 0;
  let lostLeads = 0;
  let leadStatusSummaryData = {};
  let leadSourceSummaryData = {};
  let totalDealsValue = "0.00";
  let tasksDue = 0;
  let taskStatusSummaryData = {};

  const monthlyRevenueResponse = await fetch(`${API_URL}/invoice/summary/monthly-revenue`, { headers });
  const monthlyRevenueData = await monthlyRevenueResponse.json();

  const pendingInvoiceAmountResponse = await fetch(`${API_URL}/invoice/summary/pending-amount`, { headers });
  const pendingInvoiceAmountData = await pendingInvoiceAmountResponse.json();
  const pendingAmount = (pendingInvoiceAmountData?.totalPendingAmount ?? 0).toFixed(2);

  const totalInvoicesAmountResponse = await fetch(`${API_URL}/invoice/summary/total-amount`, { headers });
  const totalInvoicesAmountData = await totalInvoicesAmountResponse.json();
  const totalInvoicesAmount = (totalInvoicesAmountData?.totalInvoicesAmount ?? 0).toFixed(2);

  const totalPaidInvoicesAmountResponse = await fetch(`${API_URL}/invoice/summary/total-paid-amount`, { headers });
  const totalPaidInvoicesAmountData = await totalPaidInvoicesAmountResponse.json();
  const totalPaidInvoicesAmount = (totalPaidInvoicesAmountData?.totalPaidInvoicesAmount ?? 0).toFixed(2);
  
  if (role === "superadmin" || role === "salesperson" || role === "admin") {
    const totalLeadsResponse = await fetch(`${API_URL}/leads?limit=1`, { headers });
    const totalLeadsData = await totalLeadsResponse.json();
    totalLeads = totalLeadsData?.totalLeads || 0;
    newContacts = totalLeads;

    const approvedQuotationsResponse = await fetch(`${API_URL}/leads?status=quotation_approved&limit=1`, { headers });
    const approvedQuotationsData = await approvedQuotationsResponse.json();
    approvedQuotations = approvedQuotationsData?.totalLeads || 0;

    const approvedInvoicesResponse = await fetch(`${API_URL}/leads?status=invoice_accepted&limit=1`, { headers });
    const approvedInvoicesData = await approvedInvoicesResponse.json();
    approvedInvoices = approvedInvoicesData?.totalLeads || 0;

    const lostLeadsResponse = await fetch(`${API_URL}/leads?status=lost&limit=1`, { headers });
    const lostLeadsData = await lostLeadsResponse.json();
    lostLeads = lostLeadsData?.totalLeads || 0;

    const leadStatusSummaryResponse = await fetch(`${API_URL}/leads/summary/status`, { headers });
    leadStatusSummaryData = await leadStatusSummaryResponse.json();

    const leadSourceSummaryResponse = await fetch(`${API_URL}/leads/summary/source`, { headers });
    leadSourceSummaryData = await leadSourceSummaryResponse.json();

    const totalDealsValueSummaryResponse = await fetch(`${API_URL}/deals/summary/total-value`, { headers });
    const totalDealsValueSummaryData = await totalDealsValueSummaryResponse.json();
    totalDealsValue = (totalDealsValueSummaryData?.totalDealsValue ?? 0).toFixed(2);

    const tasksDueSummaryResponse = await fetch(`${API_URL}/tasks/summary/due`, { headers });
    const tasksDueSummaryData = await tasksDueSummaryResponse.json();
    tasksDue = tasksDueSummaryData?.totalTasksDue || 0;

    const taskStatusSummaryResponse = await fetch(`${API_URL}/tasks/summary/status`, { headers });
    taskStatusSummaryData = await taskStatusSummaryResponse.json();
  }



  let totalFinalInvoices = 0;
  if (role === "superadmin" || role === "accounts") {
    const totalFinalInvoicesResponse = await fetch(`${API_URL}/invoice/summary/final-invoices-count`, { headers });
    const totalFinalInvoicesData = await totalFinalInvoicesResponse.json();
    totalFinalInvoices = totalFinalInvoicesData?.totalFinalInvoices;
  }

  return {
    totalLeads,
    newContacts,
    openDeals: totalDealsValue,
    tasksDue,
    approvedQuotations,
    approvedInvoices,
    lostLeads,
    pendingAmount,
    totalInvoicesAmount,
    totalPaidInvoicesAmount,
    totalFinalInvoices,
    leadStatusSummary: leadStatusSummaryData,
    leadSourceSummary: leadSourceSummaryData,
    monthlyRevenue: monthlyRevenueData,
    taskStatusSummary: taskStatusSummaryData,
  };
};
export const fetchMeetingSummary = async (): Promise<MeetingSummary> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/meetings/summary`, { headers }); // Assuming this endpoint exists
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch meeting summary');
  }
  return response.json();
};

export const fetchRecentActivities = async (): Promise<RecentActivity[]> => {
  const headers = getAuthHeaders();


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
