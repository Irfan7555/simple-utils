# Okta Vite + FastAPI Auth App

Token-based authentication with React (Okta SDK) frontend and FastAPI resource server backend.

## Architecture

**Frontend (React + Okta SDK) - Port 8000**
- Handles user authentication with Okta
- Receives ID Token and Access Token from Okta
- Sends Access Token to backend in `Authorization: Bearer` header

**Backend (FastAPI Resource Server) - Port 8001**
- Validates JWT access tokens from Okta
- Protects API endpoints
- Stateless authentication (no sessions)

```
User → Frontend (8000) → Okta Login → Access Token
                ↓
        API Request: Authorization: Bearer <token>
                ↓
        Backend (8001) → Validates JWT → Protected Data
```

## Setup

### 1. Configure Environment

Edit `.env` file in the root directory:
```env
# Frontend Okta Configuration
VITE_ISSUER=https://your-okta-domain.oktapreview.com/oauth2/default
VITE_CLIENT_ID=your_client_id_here

# Backend Token Validation
OKTA_ISSUER=https://your-okta-domain.oktapreview.com/oauth2/default
OKTA_AUDIENCE=api://default

# Application URLs
FRONTEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8001
FRONTEND_PORT=8000
BACKEND_PORT=8001
```

### 2. Okta App Settings

Your Okta application should have:
- **Application type**: Single-Page Application (SPA)
- **Sign-in redirect URIs**: `http://localhost:8000/auth`
- **Sign-out redirect URIs**: `http://localhost:8000`
- **Grant types**: Authorization Code with PKCE
- **Trusted Origins**: `http://localhost:8000` (CORS)

### 3. Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

## Run

**Backend (Terminal 1):**
```bash
cd backend
uvicorn main:app --reload --port 8001
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:8000`

## How It Works

1. **User clicks "Login"** → Frontend redirects to Okta
2. **User authenticates** → Okta redirects back to `http://localhost:8000/auth`
3. **Frontend receives tokens** → Stores access token in memory (Okta SDK)
4. **User clicks "Fetch Protected Data"** → Frontend sends API request with `Authorization: Bearer <access_token>`
5. **Backend validates token** → Fetches JWKS from Okta, verifies signature and claims
6. **Backend returns data** → Frontend displays protected data

## Files

**Backend:**
- `main.py` - FastAPI app with CORS configuration
- `middleware.py` - JWT token validation logic
- `requirements.txt` - Python dependencies

**Frontend:**
- `src/App.tsx` - Main component with Okta SDK integration
- `src/config.ts` - Okta configuration
- `src/api.ts` - API service for backend communication
- `vite.config.ts` - Vite config (port 8000)

## API Endpoints

**Public:**
- `GET /` - Root endpoint
- `GET /api/health` - Health check

**Protected (requires valid access token):**
- `GET /api/protected` - Example protected endpoint
  - Requires: `Authorization: Bearer <access_token>` header
  - Returns: User info and protected data

## Token Validation

The backend validates Okta access tokens by:
1. Fetching JWKS (public keys) from Okta's `/.well-known/openid-configuration`
2. Verifying JWT signature using RS256 algorithm
3. Validating claims:
   - `iss` (issuer) matches `OKTA_ISSUER`
   - `aud` (audience) matches `OKTA_AUDIENCE`
   - `exp` (expiration) is not expired
4. Returning decoded token claims for use in endpoints

## Troubleshooting

**Lint errors about missing modules:**
- These will be resolved after running `npm install` in the frontend directory

**401 Unauthorized errors:**
- Check that `OKTA_ISSUER` and `OKTA_AUDIENCE` are correctly set in `.env`
- Verify the access token is being sent in the `Authorization` header
- Check backend logs for specific validation errors

**CORS errors:**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Verify Okta has `http://localhost:8000` in Trusted Origins
