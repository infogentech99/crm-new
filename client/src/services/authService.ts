import { LoginCredentials, AuthResponse } from '@customTypes/index';

const API_URL = '/api/auth';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  let response;
  try {
    response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // send cookies if needed
    });
  } catch (err) {
    throw new Error(`Network error. Please try again. ${err instanceof Error ? err.message : String(err)}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Invalid server response. ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};
