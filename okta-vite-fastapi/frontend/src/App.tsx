import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { OktaAuth } from '@okta/okta-auth-js';
import { oktaConfig } from './config';
import { api } from './api';
import './App.css';

const oktaAuth = new OktaAuth(oktaConfig);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}

// Custom callback handler - intercepts authorization code
function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (processing) return;

    const handleCallback = async () => {
      // Extract authorization code from URL
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');

      // Check for Okta error response first
      const oktaError = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      if (oktaError) {
        setError(`Okta error: ${oktaError} - ${errorDescription || 'No description'}`);
        return;
      }

      // If no code and no error, user navigated here directly - redirect home
      if (!code) {
        console.log('No authorization code in URL, redirecting to home');
        navigate('/', { replace: true });
        return;
      }

      setProcessing(true);

      try {
        // Send code to backend for token exchange
        const tokenData = await api.exchangeCodeForToken(code, oktaConfig.redirectUri);

        // Store tokens in localStorage
        localStorage.setItem('access_token', tokenData.access_token);
        localStorage.setItem('id_token', tokenData.id_token);
        localStorage.setItem('user', JSON.stringify(tokenData.user));

        // Redirect to home
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Token exchange error:', err);
        setError(err instanceof Error ? err.message : 'Token exchange failed');
        setProcessing(false);
      }
    };

    handleCallback();
  }, [location, navigate, processing]);

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2>Authentication Error</h2>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={() => navigate('/')} className="btn">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <p>Processing authentication...</p>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [protectedData, setProtectedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('user');
    setUser(null);
    setAccessToken(null);
    setProtectedData(null);
  };

  const fetchProtectedData = async () => {
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.fetchProtectedData(accessToken);
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
        <h1>🔐 Okta Authentication</h1>

        {user ? (
          <div>
            <p className="welcome">Welcome, <strong>{user.name}</strong>!</p>
            <p className="email">{user.email}</p>

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
