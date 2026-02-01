const CLIENT_ID = '0oazq0ngiljkVdkf5697';
const ISSUER = 'https://trial-7255425.okta.com/oauth2/default';
const REDIRECT_URI = 'http://localhost:8000/auth';

export const oktaConfig = {
  clientId: CLIENT_ID,
  issuer: ISSUER,
  redirectUri: REDIRECT_URI,
  scopes: ['openid', 'profile', 'email'],
  // Authorization Code flow - backend exchanges code with client_secret
  pkce: false,
  responseType: 'code',
};

