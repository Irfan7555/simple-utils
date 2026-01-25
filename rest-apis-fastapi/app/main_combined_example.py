"""
Example of how to integrate psycopg routes into the existing main.py
This shows both SQLAlchemy and psycopg routes running side-by-side
"""
from fastapi import FastAPI, status, Depends, HTTPException
from . import models
from .database import engine, SessionLocal
from sqlalchemy.orm import Session
from typing import Annotated

# Import both SQLAlchemy and psycopg routers
from .routers import auth as auth_router
from .routers import blog as blog_router
from .routers import auth_psycopg
from .routers import blog_psycopg

from .utils import get_current_user
from .database_psycopg import init_db, close_pool

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

# Include SQLAlchemy routers (existing)
app.include_router(auth_router.router)
app.include_router(blog_router.router)

# Include psycopg routers (new - for comparison)
app.include_router(auth_psycopg.router)
app.include_router(blog_psycopg.router)

# SQLAlchemy table creation (existing)
models.Base.metadata.create_all(bind=engine)

# psycopg table initialization (new)
@app.on_event("startup")
async def startup_event():
    """Initialize psycopg database tables on startup"""
    init_db()

@app.on_event("shutdown")
async def shutdown_event():
    """Close psycopg connection pool on shutdown"""
    close_pool()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "ok", "service": "fastapi-backend"}

@app.get("/", status_code=status.HTTP_200_OK)
async def user(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"User": user}

# Example endpoint showing the difference
@app.get("/api-info", status_code=status.HTTP_200_OK)
async def api_info():
    return {
        "message": "This API supports both SQLAlchemy and psycopg implementations",
        "routes": {
            "sqlalchemy": {
                "auth": "/auth/*",
                "blogs": "/blogs/*",
                "description": "ORM-based routes using SQLAlchemy"
            },
            "psycopg": {
                "auth": "/auth-psycopg/*",
                "blogs": "/blogs-psycopg/*",
                "description": "Raw SQL routes using psycopg"
            }
        }
    }
