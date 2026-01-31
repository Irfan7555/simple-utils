import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from jose import jwt

router = APIRouter(prefix="/auth", tags=["authentication"])

# Load Okta configuration
OKTA_ISSUER = os.getenv("OKTA_ISSUER")
OKTA_CLIENT_ID = os.getenv("OKTA_CLIENT_ID")
OKTA_CLIENT_SECRET = os.getenv("OKTA_CLIENT_SECRET")
TOKEN_ENDPOINT = f"{OKTA_ISSUER}/v1/token"


class TokenExchangeRequest(BaseModel):
    code: str
    redirect_uri: str


@router.post("/callback")
async def exchange_code_for_token(request: TokenExchangeRequest):
    """
    Exchange authorization code for access token.
    
    This endpoint receives the authorization code from the frontend
    and exchanges it with Okta using the client secret (confidential client).
    
    IMPORTANT: redirect_uri must EXACTLY match what's configured in Okta.
    
    SECURITY NOTE: This implementation returns raw access tokens to the frontend
    for simplicity. For production, consider:
    - Issuing your own session token instead
    - Using httpOnly cookies for token storage
    - Implementing token refresh logic on the backend
    
    Returns the access token to the frontend for subsequent API calls.
    """
    try:
        # Validate redirect_uri (should match Okta configuration exactly)
        # Expected: http://localhost:8000/auth
        if not request.redirect_uri:
            raise HTTPException(
                status_code=400,
                detail="redirect_uri is required"
            )
        
        # Exchange authorization code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                TOKEN_ENDPOINT,
                data={
                    "grant_type": "authorization_code",
                    "code": request.code,
                    "redirect_uri": request.redirect_uri,  # Must match Okta config
                    "client_id": OKTA_CLIENT_ID,
                    "client_secret": OKTA_CLIENT_SECRET,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=token_response.status_code,
                    detail=f"Token exchange failed: {token_response.text}"
                )
            
            tokens = token_response.json()
        
        # Decode ID token to get user info (no signature verification needed here,
        # as we just received it directly from Okta)
        id_token = tokens.get("id_token")
        user_info = jwt.get_unverified_claims(id_token)
        
        # Return tokens and user info to frontend
        # SECURITY: Consider not exposing raw tokens in production
        return {
            "access_token": tokens.get("access_token"),
            "id_token": tokens.get("id_token"),
            "expires_in": tokens.get("expires_in"),
            "token_type": tokens.get("token_type"),
            "user": {
                "sub": user_info.get("sub"),
                "name": user_info.get("name"),
                "email": user_info.get("email"),
            }
        }
        
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"HTTP error during token exchange: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Token exchange failed: {str(e)}"
        )
