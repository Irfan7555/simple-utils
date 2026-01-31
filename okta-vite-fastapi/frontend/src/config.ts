const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || '';
const ISSUER = import.meta.env.VITE_ISSUER || '';
const REDIRECT_URI = `${window.location.origin}/auth`;

export const oktaConfig = {
  clientId: CLIENT_ID,
  issuer: ISSUER,
  redirectUri: REDIRECT_URI,
  scopes: ['openid', 'profile', 'email'],
  // PKCE not needed - backend exchanges code with client_secret
  pkce: false,
};
