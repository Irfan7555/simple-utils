"""
Alternative main.py using psycopg2-binary instead of SQLAlchemy
This demonstrates how to set up FastAPI with direct PostgreSQL access
"""
from fastapi import FastAPI, status, Depends, HTTPException
from typing import Annotated

from .database_psycopg import init_db
from .routers import auth_psycopg as auth_router
from .routers import blog_psycopg as blog_router
from .routers.auth_psycopg import get_current_user

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with psycopg implementation
app.include_router(auth_router.router)
app.include_router(blog_router.router)

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables when the application starts"""
    init_db()

user_dependency = Annotated[dict, Depends(get_current_user)]

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "ok", "service": "fastapi-backend-psycopg"}

@app.get("/", status_code=status.HTTP_200_OK)
async def user(user: user_dependency):
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    return {"User": user}
