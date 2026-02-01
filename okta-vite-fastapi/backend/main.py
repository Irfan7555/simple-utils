import os
from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from dotenv import load_dotenv

from middleware import get_current_user
from auth import router as auth_router

# Load environment variables from parent directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Security scheme for Swagger UI
security_scheme = HTTPBearer()

app = FastAPI(
    title="Okta Auth API - Resource Server",
    swagger_ui_init_oauth={
        "clientId": os.getenv("OKTA_CLIENT_ID"),
        "usePkceWithAuthorizationCodeGrant": True,
    }
)

# CORS configuration for frontend on port 8000
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(auth_router)


@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Okta FastAPI Resource Server is running",
        "description": "This server validates Okta access tokens"
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/api/protected", dependencies=[Depends(security_scheme)])
async def protected_route(user: dict = Depends(get_current_user)):
    """
    Protected route - requires valid Okta access token.
    The get_current_user dependency validates the JWT token.

    Click the 'Authorize' button and paste your access token.
    """
    return {
        "message": f"Hello! You are authenticated.",
        "user": {
            "sub": user.get("sub"),
            "email": user.get("email"),
            "name": user.get("name"),
        },
        "data": "This is protected data from the backend"
    }


@app.get("/api/test", dependencies=[Depends(security_scheme)])
def test_route(user: dict = Depends(get_current_user)):
    """Test route - requires valid Okta access token."""
    return {"message": "Hello World"}