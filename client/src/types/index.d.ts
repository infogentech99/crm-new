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
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  date: string;
}

export interface Lead {
  _id: string;
  name: string;
  company: string;
  createdAt: string;
}
