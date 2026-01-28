# Psycopg Implementation Comparison

This directory contains parallel implementations using **psycopg** (direct PostgreSQL driver) alongside the existing **SQLAlchemy** ORM approach.

## Files Created

### Core Database Layer
- **`database_psycopg.py`** - Connection pooling and database initialization
  - Replaces: `database.py` (SQLAlchemy)
  - Uses `psycopg_pool.ConnectionPool` for efficient connection management
  - Raw SQL for table creation instead of ORM models

### Routers
- **`routers/auth_psycopg.py`** - Authentication with raw SQL
  - Replaces: `routers/auth.py`
  - Routes: `/auth-psycopg/*`
  
- **`routers/blog_psycopg.py`** - Blog CRUD with raw SQL
  - Replaces: `routers/blog.py`
  - Routes: `/blogs-psycopg/*`

### Application Entry
- **`main_psycopg.py`** - Alternative FastAPI app
  - Replaces: `main.py`
  - Includes startup/shutdown events for DB initialization

## Key Differences

| Aspect | SQLAlchemy (Current) | psycopg (New) |
|--------|---------------------|---------------|
| **Database** | SQLite (with `check_same_thread`) | PostgreSQL only |
| **Queries** | ORM methods (`db.query(Model)`) | Raw SQL with parameterized queries |
| **Models** | Python classes (`models.py`) | SQL DDL statements |
| **Connections** | Session-based | Connection pool |
| **Type Safety** | ORM provides Python types | Manual dict/tuple handling |
| **Migrations** | Alembic (not currently used) | Manual SQL scripts |

## Usage

### Install Dependencies
```bash
pip install psycopg[binary] psycopg-pool
```

### Update Environment Variables
```env
# Change from SQLite to PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Run with psycopg
```python
# In main_psycopg.py or update main.py imports
from app.routers import auth_psycopg, blog_psycopg
```

## Code Examples

### Creating a User

**SQLAlchemy:**
```python
create_user_model = Users(
    username=create_user_request.username,
    hashed_password=bcrypt_context.hash(password)
)
db.add(create_user_model)
db.commit()
db.refresh(create_user_model)
```

**psycopg:**
```python
cur.execute(
    """
    INSERT INTO users (username, hashed_password)
    VALUES (%s, %s)
    RETURNING id, username
    """,
    (username, hashed_password)
)
user = cur.fetchone()
```

### Querying Blogs

**SQLAlchemy:**
```python
blogs = db.query(Blog).filter(Blog.published == True).all()
```

**psycopg:**
```python
cur.execute(
    "SELECT * FROM blogs WHERE published = TRUE ORDER BY created_at DESC"
)
blogs = cur.fetchall()
```

## Pros of psycopg Approach

✅ **Direct control** over SQL queries  
✅ **Better performance** for simple queries (no ORM overhead)  
✅ **Lighter dependencies** (no SQLAlchemy)  
✅ **Connection pooling** built-in with `psycopg_pool`  
✅ **Explicit SQL** makes debugging easier  

## Cons of psycopg Approach

❌ **No database abstraction** (PostgreSQL only)  
❌ **Manual SQL** for all operations  
❌ **No automatic migrations** (need custom scripts)  
❌ **More boilerplate** for complex queries  
❌ **Manual type conversion** from DB to Python  
❌ **No relationship handling** (manual JOINs required)  

## Recommendation

**Stick with SQLAlchemy** for this project because:
1. You have relationships (`Blog.owner_id` → `Users.id`)
2. Currently using SQLite (would need PostgreSQL for psycopg)
3. May want database portability later
4. ORM benefits outweigh the small performance cost

**Consider psycopg** if:
- You're committed to PostgreSQL
- Need maximum performance for read-heavy workloads
- Have simple data models with few relationships
- Prefer explicit SQL over ORM abstractions

## Testing Both Approaches

Both implementations can coexist. Test them side-by-side:

1. **SQLAlchemy routes**: `/auth/*`, `/blogs/*`
2. **psycopg routes**: `/auth-psycopg/*`, `/blogs-psycopg/*`

Compare performance, code clarity, and maintenance effort before deciding.
