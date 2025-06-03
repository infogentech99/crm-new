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

  // Fetch Total Leads
  const leadsResponse = await fetch(`${API_URL}/leads`, { headers });
  const leadsData = await leadsResponse.json();
  const totalLeads = leadsData.total || 0;

  // Fetch Total Contacts
  const contactsResponse = await fetch(`${API_URL}/contacts`, { headers });
  const contactsData = await contactsResponse.json();
  const newContacts = contactsData.count || 0; // Assuming 'new contacts' refers to total contacts for now

  // Fetch Deals and calculate Open Deals value
  const dealsResponse = await fetch(`${API_URL}/deals`, { headers });
  const dealsData = await dealsResponse.json();
  let openDealsValue = 0;
  if (Array.isArray(dealsData)) {
    // Assuming each deal has a 'value' property and 'status' property
    const openDeals = dealsData.filter(deal => deal.status === 'open' || !deal.status); // Assuming no status means open
    openDealsValue = openDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  }

  // Fetch Tasks and count Tasks Due
  const tasksResponse = await fetch(`${API_URL}/tasks`, { headers });
  const tasksData = await tasksResponse.json();
  const tasksDue = Array.isArray(tasksData) ? tasksData.length : 0; // Assuming 'tasks due' refers to total tasks for now

  return {
    totalLeads: totalLeads,
    newContacts: newContacts,
    openDeals: openDealsValue.toFixed(2),
    tasksDue: tasksDue,
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
