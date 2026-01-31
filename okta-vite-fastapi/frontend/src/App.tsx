import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { Security, LoginCallback, useOktaAuth } from '@okta/okta-react';
import { oktaConfig } from './config';
import { api } from './api';
import './App.css';

const oktaAuth = new OktaAuth(oktaConfig);

function App() {
  return (
    <Router>
      <AppWithRouter />
    </Router>
  );
}

function AppWithRouter() {
  const navigate = useNavigate();

  const restoreOriginalUri = async (_oktaAuth: OktaAuth, originalUri: string) => {
    navigate(toRelativeUrl(originalUri || '/', window.location.origin), { replace: true });
  };

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<LoginCallback />} />
      </Routes>
    </Security>
  );
}

function Home() {
  const { oktaAuth, authState } = useOktaAuth();
  const [protectedData, setProtectedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    await oktaAuth.signInWithRedirect();
  };

  const logout = async () => {
    await oktaAuth.signOut();
    setProtectedData(null);
  };

  const fetchProtectedData = async () => {
    if (!authState?.accessToken) {
      setError('No access token available');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await api.fetchProtectedData(authState.accessToken.accessToken);
      setProtectedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (!authState) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1>🔐 Okta Authentication</h1>
        
        {authState.isAuthenticated ? (
          <div>
            <p className="welcome">Welcome, <strong>{authState.idToken?.claims.name}</strong>!</p>
            <p className="email">{authState.idToken?.claims.email}</p>
            
            <div style={{ marginTop: '20px' }}>
              <button onClick={fetchProtectedData} className="btn" disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Protected Data'}
              </button>
              <button onClick={logout} className="btn" style={{ marginLeft: '10px' }}>
                Logout
              </button>
            </div>

            {error && (
              <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>
            )}

            {protectedData && (
              <div style={{ marginTop: '20px', textAlign: 'left', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
                <h3>Protected Data from Backend:</h3>
                <pre>{JSON.stringify(protectedData, null, 2)}</pre>
              </div>
            )}
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

export default App;
