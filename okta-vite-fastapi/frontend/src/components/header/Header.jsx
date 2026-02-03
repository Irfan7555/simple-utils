import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logout } from '../agent/agentService';

export default function Header() {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('access_token'));
    }, [location]);

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6'
        }}>
            <div className="logo">
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Okta Vite FastAPI</h1>
            </div>
            <nav>
                {isLoggedIn && (
                    <button
                        onClick={handleLogout}
                        className="btn"
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                )}
            </nav>
        </header>
    );
}
