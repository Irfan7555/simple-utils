import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { oktaConfig } from '../../config';
import { exchangeCodeForToken } from '../agent/agentService';

function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const hasCalled = useRef(false);

    useEffect(() => {
        // Prevent double execution in StrictMode/Concurrent renders
        if (hasCalled.current) return;
        hasCalled.current = true;

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
                const tokenData = await exchangeCodeForToken(code, oktaConfig.redirectUri);

                // Store tokens in localStorage
                localStorage.setItem('access_token', tokenData.access_token);
                localStorage.setItem('id_token', tokenData.id_token);
                localStorage.setItem('user', JSON.stringify(tokenData.user));

                // Redirect to test page
                navigate('/test', { replace: true });
            } catch (err) {
                console.error('Token exchange error:', err);
                setError(err.message || 'Token exchange failed');
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

export default AuthCallback;
