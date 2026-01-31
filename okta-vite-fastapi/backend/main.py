import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from middleware import get_current_user
from auth import router as auth_router

# Load environment variables
load_dotenv(dotenv_path="../.env")

app = FastAPI(title="Okta Auth API - Resource Server")

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


@app.get("/api/protected")
async def protected_route(user: dict = Depends(get_current_user)):
    """
    Protected route - requires valid Okta access token.
    The get_current_user dependency validates the JWT token.
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
