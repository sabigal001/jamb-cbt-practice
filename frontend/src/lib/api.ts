const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  console.log('DEBUG: Using API URL:', url);
  // Remove trailing slash if it exists
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const register = async (userData: any) => {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register');
    }
    return await response.json();
  } catch (error) {
    console.error('Registration Error:', error);
    throw error;
  }
};

export const login = async (credentials: any) => {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to login');
    }
    return await response.json();
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

export const fetchQuestions = async (mode: 'mock' | 'drill', subject?: string) => {
  const baseUrl = getBaseUrl();
  const endpoint = mode === 'mock' 
    ? `/api/questions/mock/?subject=${subject || 'biology'}` 
    : `/api/questions/drill/?subject=${subject || 'biology'}`;
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch questions');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const saveResult = async (token: string, resultData: any) => {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/profile/save_result/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resultData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save result');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updateProfile = async (token: string, profileData: any) => {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/profile/update_profile/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update profile');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getHistory = async (token: string) => {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/profile/history/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getProfile = async (token: string) => {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    const data = await response.json();
    return data[0]; // ModelViewSet returns an array for list
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
