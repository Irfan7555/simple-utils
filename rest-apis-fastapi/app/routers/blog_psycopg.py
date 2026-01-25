"""
Blog router using psycopg2-binary directly instead of SQLAlchemy
This is an alternative implementation to routers/blog.py
"""
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

from app.database_psycopg import create_connection
from app.schemas import BlogCreate, BlogResponse

# Import get_current_user from the psycopg auth router
from app.routers.auth_psycopg import get_current_user

router = APIRouter(
    prefix="/blogs-psycopg",
    tags=["blogs-psycopg"]
)

user_dependency = Annotated[dict, Depends(get_current_user)]

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=BlogResponse)
async def create_blog(user: user_dependency, blog_request: BlogCreate):
    """Create a new blog post using raw SQL"""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
    
    # Generate slug from title
    slug = blog_request.title.lower().replace(" ", "-")
    
    conn = create_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if slug exists
        cur.execute(
            "SELECT id FROM blogs WHERE slug = %s",
            (slug,)
        )
        existing_blog = cur.fetchone()
        
        # Make slug unique if it already exists
        if existing_blog:
            slug = f"{slug}-{int(datetime.now().timestamp())}"
        
        # Insert new blog
        cur.execute(
            """
            INSERT INTO blogs (title, content, slug, published, created_at, owner_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, title, content, slug, published, created_at, owner_id
            """,
            (
                blog_request.title,
                blog_request.content,
                slug,
                blog_request.published,
                datetime.utcnow().isoformat(),
                user.get('id')
            )
        )
        blog = cur.fetchone()
        conn.commit()
        cur.close()
        return blog
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[BlogResponse])
async def read_all_blogs():
    """Get all published blogs using raw SQL"""
    conn = create_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """
            SELECT id, title, content, slug, published, created_at, owner_id
            FROM blogs
            WHERE published = TRUE
            ORDER BY created_at DESC
            """
        )
        blogs = cur.fetchall()
        cur.close()
        return blogs
    finally:
        conn.close()

@router.get("/{blog_id}", status_code=status.HTTP_200_OK, response_model=BlogResponse)
async def read_blog(blog_id: int):
    """Get a specific blog by ID using raw SQL"""
    conn = create_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """
            SELECT id, title, content, slug, published, created_at, owner_id
            FROM blogs
            WHERE id = %s
            """,
            (blog_id,)
        )
        blog = cur.fetchone()
        cur.close()
        
        if blog is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Blog not found'
            )
        
        return blog
    finally:
        conn.close()

@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(user: user_dependency, blog_id: int):
    """Delete a blog post using raw SQL"""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
    
    conn = create_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # First, check if blog exists and get owner_id
        cur.execute(
            "SELECT owner_id FROM blogs WHERE id = %s",
            (blog_id,)
        )
        blog = cur.fetchone()
        
        if blog is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Blog not found'
            )
        
        # Check if user is the owner
        if blog["owner_id"] != user.get('id'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this blog"
            )
        
        # Delete the blog
        cur.execute(
            "DELETE FROM blogs WHERE id = %s",
            (blog_id,)
        )
        conn.commit()
        cur.close()
    except HTTPException:
        raise
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

