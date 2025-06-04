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
  // Mock data for demonstration purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalLeads: 63,
        newContacts: 15,
        openDeals: "12500.00",
        tasksDue: 5,
        approvedQuotations: 4,
        approvedInvoices: 0,
        lostLeads: 2,
      });
    }, 500); // Simulate network delay
  });
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
