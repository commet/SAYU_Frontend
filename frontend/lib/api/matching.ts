const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface MatchedUser {
  id: string;
  nickname: string;
  age: number;
  user_purpose: string;
  type_code: string;
  archetype_name: string;
  generated_image_url?: string;
}

export interface MatchingResponse {
  purpose: string;
  users: MatchedUser[];
  total: number;
}

export const getCompatibleUsers = async (purpose?: string): Promise<MatchingResponse> => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token found');
  }

  const url = purpose 
    ? `${API_URL}/api/matching/compatible?purpose=${purpose}`
    : `${API_URL}/api/matching/compatible`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch compatible users');
  }

  return response.json();
};

export const getUsersByPurpose = async (purpose: string): Promise<MatchingResponse> => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${API_URL}/api/matching/purpose/${purpose}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch users by purpose');
  }

  return response.json();
};