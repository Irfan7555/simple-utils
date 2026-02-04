import { useState, useEffect } from 'react';
import { OktaAuth } from '@okta/okta-auth-js';
import { oktaConfig } from '../../config';
import { fetchProtectedData, logout } from '../agent/agentService';


const oktaAuth = new OktaAuth(oktaConfig);

function Login() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [protectedData, setProtectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async () => {
    // Redirect to Okta for authorization code
    await oktaAuth.signInWithRedirect();
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

  return (
    <div className="container">
      <div className="card">
        {user ? (
          <div>
            <p className="description">You are already logged in</p>
            <button onClick={() => window.location.href = '/test'} className="btn">
              Go to Test Page
            </button>
          </div>
        ) : (
          <div>
            <p className="description">Click to authenticate with Okta</p>
            <button onClick={login} className="btn">Login</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
