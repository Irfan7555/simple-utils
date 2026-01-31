const BACKEND_URL = "http://localhost:8001";

export const api = {
  /**
   * Exchange authorization code for access token via backend
   */
  exchangeCodeForToken: async (code: string, redirectUri: string) => {
    const response = await fetch(`${BACKEND_URL}/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json();
  },

  /**
   * Fetch protected data from backend with access token
   */
  fetchProtectedData: async (accessToken: string) => {
    const response = await fetch(`${BACKEND_URL}/api/protected`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch protected data: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Health check endpoint
   */
  healthCheck: async () => {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    
    return response.json();
  },
};
