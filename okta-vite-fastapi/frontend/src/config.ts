import type { OAuthResponseType } from '@okta/okta-auth-js';

// Load from environment variables (Vite uses import.meta.env with VITE_ prefix)
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const ISSUER = import.meta.env.VITE_ISSUER;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:8000/auth';

export const oktaConfig = {
  clientId: CLIENT_ID,
  issuer: ISSUER,
  redirectUri: REDIRECT_URI,
  scopes: ['openid', 'profile', 'email'],
  // Authorization Code flow - backend exchanges code with client_secret
  pkce: false,
  responseType: 'code' as OAuthResponseType,
};

