import { useState, useEffect } from 'react';
import { fetchProtectedData } from '../agent/agentService';

export default function Test() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [response, setResponse] = useState(null);
  const [protectedData, setProtectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setAccessToken(storedToken);
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const callTestApi = async () => {
    if (!accessToken) {
      setError('No access token available. Please log in first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8001/api/test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err.message || 'Failed to call API');
      console.error('Error calling test API:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProtectedData = async () => {
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProtectedData(accessToken);
      setProtectedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return <div className="p-4 text-red-600">Please log in first</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1>🔐 Okta Authentication</h1>

        {user && (
          <div>
            <p className="welcome">Welcome, <strong>{user.name}</strong>!</p>
            <p className="email">{user.email}</p>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={callTestApi}
            disabled={loading}
            className="btn"
          >
            {loading ? 'Loading...' : 'Call /api/test'}
          </button>

          <button 
            onClick={handleFetchProtectedData} 
            className="btn" 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Fetch Protected Data'}
          </button>
        </div>

        {error && (
          <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>
        )}

        {response && (
          <div style={{ marginTop: '20px', textAlign: 'left', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
            <h3>Test API Response:</h3>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}

        {protectedData && (
          <div style={{ marginTop: '20px', textAlign: 'left', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
            <h3>Protected Data from Backend:</h3>
            <pre>{JSON.stringify(protectedData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
