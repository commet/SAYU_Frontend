const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UpdateUserPurposeResponse {
  message: string;
  userPurpose: string;
}

export const updateUserPurpose = async (purpose: string): Promise<UpdateUserPurposeResponse> => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${API_URL}/api/auth/purpose`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userPurpose: purpose }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user purpose');
  }

  return response.json();
};