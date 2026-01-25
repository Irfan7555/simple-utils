"""
Database connection management using psycopg2-binary (direct PostgreSQL driver)
This is an alternative to the SQLAlchemy-based database.py
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL connection string
# Format: postgresql://user:password@host:port/database
DATABASE_URL = os.getenv("DATABASE_URL")

def create_connection():
    """
    Create a simple database connection.
    Returns a connection object.
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise

def get_db_cursor():
    """
    Dependency for FastAPI endpoints that need a database cursor.
    Returns results as dictionaries.
    
    Usage in FastAPI:
        @app.get("/users")
        def get_users(cur = Depends(get_db_cursor)):
            cur.execute("SELECT * FROM users")
            return cur.fetchall()
    """
    conn = create_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def init_db():
    """
    Initialize database tables.
    This replaces SQLAlchemy's Base.metadata.create_all()
    """
    conn = create_connection()
    try:
        cur = conn.cursor()
        
        # Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL
            )
        """)
        
        # Create index on username
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_username 
            ON users(username)
        """)
        
        # Create blogs table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS blogs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                published BOOLEAN DEFAULT FALSE,
                created_at VARCHAR(255) NOT NULL,
                owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Create indexes on blogs
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_blogs_slug 
            ON blogs(slug)
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_blogs_owner_id 
            ON blogs(owner_id)
        """)
        
        conn.commit()
        cur.close()
    except Exception as e:
        conn.rollback()
        raise
    finally:
        conn.close()
