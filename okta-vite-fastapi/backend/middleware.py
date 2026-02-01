import os
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import HTTPException, Request
from jose import jwt, JWTError, jwk
from jose.utils import base64url_decode
import httpx
import json
from dotenv import load_dotenv

# Load environment variables from parent directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Load Okta configuration
OKTA_ISSUER = os.getenv("OKTA_ISSUER")
OKTA_AUDIENCE = os.getenv("OKTA_AUDIENCE", "api://default")

# Cache for JWKS
_jwks_cache: Optional[Dict] = None


async def get_jwks() -> Dict:
    """Fetch Okta's JWKS (JSON Web Key Set) for token verification"""
    global _jwks_cache
    
    if _jwks_cache is not None:
        return _jwks_cache
    
    # Fetch JWKS from Okta's well-known endpoint
    jwks_uri = f"{OKTA_ISSUER}/v1/keys"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(jwks_uri)
        response.raise_for_status()
        _jwks_cache = response.json()
        return _jwks_cache


async def verify_access_token(token: str) -> Dict[str, Any]:
    """
    Verify Okta access token signature and claims.
    
    Steps:
    1. Fetch JWKS from Okta
    2. Verify JWT signature using RS256
    3. Validate claims (issuer, audience, expiration)
    
    Returns:
        Decoded token claims
        
    Raises:
        HTTPException: If token is invalid
    """
    try:
        # Get JWKS
        jwks = await get_jwks()
        
        # Decode token header to get key ID (kid)
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        if not kid:
            raise HTTPException(status_code=401, detail="Token missing key ID")
        
        # Find the matching key in JWKS
        key = None
        for jwk_key in jwks.get("keys", []):
            if jwk_key.get("kid") == kid:
                key = jwk_key
                break
        
        if not key:
            raise HTTPException(status_code=401, detail="Unable to find matching key")
        
        # Verify and decode token
        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=OKTA_AUDIENCE,
            issuer=OKTA_ISSUER,
        )
        
        return claims
        
    except JWTError as e:
        # Debug: print the unverified claims to see what's in the token
        try:
            unverified_claims = jwt.get_unverified_claims(token)
            print(f"❌ JWT Validation Error: {str(e)}")
            print(f"   Token issuer: {unverified_claims.get('iss')}")
            print(f"   Token audience: {unverified_claims.get('aud')}")
            print(f"   Expected issuer: {OKTA_ISSUER}")
            print(f"   Expected audience: {OKTA_AUDIENCE}")
        except:
            pass
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"❌ Token validation error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(request: Request) -> Dict[str, Any]:
    """
    FastAPI dependency to extract and validate access token from Authorization header.
    
    Usage:
        @app.get("/api/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            return {"message": f"Hello {user['sub']}"}
    """
    # Extract Authorization header
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check Bearer scheme
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = parts[1]
    
    # Verify token and return claims
    claims = await verify_access_token(token)
    return claims
