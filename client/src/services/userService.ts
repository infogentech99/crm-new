import { User, RecentActivity } from '@customTypes/index'; // Assuming User type will be defined

const API_URL = '/api/users'; // Base URL for user endpoints

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

interface GetUsersResponse {
  users: User[];
  total: number;
  pages: number;
}

export const fetchUsers = async (page: number = 1, limit: number = 10, roleFilter?: string): Promise<GetUsersResponse> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (roleFilter) {
    url += `&roleFilter=${roleFilter}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch users');
  }

  return response.json();
};

export const fetchUserActivities = async (userId: string): Promise<RecentActivity[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/${userId}/activities`, { headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user activities');
  }

  const data = await response.json();
  // Transform the data to match the RecentActivity interface
  const activities: RecentActivity[] = [];
  if (data.leads) {
    data.leads.forEach((lead: any) => {
      activities.push({
        id: lead._id,
        type: 'Lead',
        description: `New lead: ${lead.name} from ${lead.company}`,
        date: new Date(lead.createdAt).toLocaleDateString(),
      });
    });
  }
  if (data.meetings) {
    data.meetings.forEach((meeting: any) => {
      activities.push({
        id: meeting._id,
        type: 'Meeting',
        description: `Meeting with ${meeting.client}`,
        date: new Date(meeting.date).toLocaleDateString(),
      });
    });
  }
   if (data.tasks) {
    data.tasks.forEach((task: any) => {
      activities.push({
        id: task._id,
        type: 'Task',
        description: `Task: ${task.description}`,
        date: new Date(task.dueDate).toLocaleDateString(),
      });
    });
  }

  return activities;
};
