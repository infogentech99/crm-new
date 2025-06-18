// File: src/services/userService.ts

import { User, RecentActivity } from "@customTypes/index";

const API_URL = "/api/users";

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

interface GetUsersResponse {
  users: User[];
  total: number;
  pages: number;
}

/**
 * Fetch a paginated list of users.
 * @param page - Page number (default 1)
 * @param limit - Items per page (default 10)
 * @param roleFilter - Optional: if provided, filters by role
 * @returns { users: User[]; total: number; pages: number }
 */
export const fetchUsers = async (
  page: number = 1,
  limit: number = 10,
  roleFilter?: string
): Promise<GetUsersResponse> => {
  const headers = getAuthHeaders();
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (roleFilter) {
    url += `&roleFilter=${roleFilter}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch users");
  }
  return response.json();
};


export const fetchUserById = async (id: string): Promise<User> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/${id}`, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch user ${id}`);
  }
  return response.json();
};


/**
 * Create a new user. Only superadmin may call.
 * @param userData - { name, email, role, password }
 * @returns The created User object (without password field)
 */
export const createUser = async (userData: {
  name: string;
  email: string;
  role: string;
  password: string;
}): Promise<User> => {
  const headers = getAuthHeaders();
  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create user");
  }
  return response.json();
};

/**
 * Update an existing user by ID. Only superadmin may call.
 * @param id - user ID
 * @param userData - Partial fields to update: { name?, email?, role? }
 * @returns The updated User object (without password field)
 */
export const updateUser = async (
  id: string,
  userData: { name?: string; email?: string; role?: string }
): Promise<User> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update user ${id}`);
  }
  return response.json();
};

/**
 * Delete a user by ID. Only superadmin may call.
 * @param id - user ID
 * @returns { message: string }
 */
export const deleteUser = async (
  id: string
): Promise<{ message: string }> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete user ${id}`);
  }
  return response.json();
};

/**
 * Fetch recent activities (leads, meetings, tasks) for a given user.
 * Only superadmin may call.
 * @param userId - user ID
 * @returns RecentActivity[] array
 */
export const fetchUserActivities = async (
  userId: string
): Promise<RecentActivity[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/${userId}/activities`, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch user activities");
  }

  const data = await response.json();
  const activities: RecentActivity[] = [];

  if (data.leads) {
    data.leads.forEach((lead: any) => {
      activities.push({
        id: lead._id,
        type: "Lead",
       description: lead.description || '-',
        date: new Date(lead.createdAt).toLocaleDateString(),
        name: lead.name,
        company: lead.company,
      });
    });
  }
  if (data.meetings) {
    data.meetings.forEach((meeting: any) => {
      activities.push({
        id: meeting._id,
        type: "Meeting",
         description: meeting.description || '-',
        date: new Date(meeting.date).toLocaleDateString(),
        title: meeting.title,
        time: meeting.date,
        participants: meeting.participants,
      });
    });
  }
  if (data.tasks) {
    data.tasks.forEach((task: any) => {
      activities.push({
        id: task._id,
        type: "Task",
         description: task.description || '-',
        date: new Date(task.dueDate).toLocaleDateString(),
        title: task.title ,
        assignee: task.assignee,
        status: task.status,
      });
    });
  }

  return activities;
};
