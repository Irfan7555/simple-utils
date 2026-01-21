import { Blog, CreateBlogRequest, CreateUserRequest, Token } from "./types";

const API_URL = "http://localhost:8000";

let accessToken = '';

export function setAccessToken(token: string) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function fetchBlogs(): Promise<Blog[]> {
  const res = await fetch(`${API_URL}/blogs`, {
    cache: "no-store", 
  });
  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }
  return res.json();
}

export async function fetchBlogById(id: number): Promise<Blog> {
  const res = await fetch(`${API_URL}/blogs/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch blog");
  }
  return res.json();
}

// Wrapper for authenticated requests with retry logic
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    if (!accessToken) {
        // Optimistically try to refresh before first request if no token
        try {
            await refreshAuth();
        } catch (e) {
             // If refresh fails, let the request proceed (it might fail 401, which is expected)
             // or throw error depending on strictness.
        }
    }
    
    // Helper to setup headers
    const getHeaders = () => ({
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
    });

    let res = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: getHeaders(),
    });

    if (res.status === 401) {
        // Token might be expired, try refresh
        try {
            await refreshAuth();
            // Retry with new token
             res = await fetch(`${API_URL}${url}`, {
                ...options,
                headers: getHeaders(),
            });
        } catch (error) {
            throw new Error("Authentication session expired.");
        }
    }
    
    return res;
}

export async function refreshAuth() {
    const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
             "Content-Type": "application/json", // Some backends might need no content type for empty body
        },
        credentials: "include" // Important: sends cookies
    });
    
    if (!res.ok) {
        throw new Error("Failed to refresh token");
    }
    
    const data: Token = await res.json();
    setAccessToken(data.access_token);
    return data;
}


export async function createBlog(blog: CreateBlogRequest): Promise<Blog> {
  const res = await fetchWithAuth(`/blogs`, {
      method: 'POST',
      body: JSON.stringify(blog)
  });

  if (!res.ok) {
    throw new Error("Failed to create blog");
  }
  return res.json();
}

export async function registerUser(user: CreateUserRequest): Promise<any> {
    const res = await fetch(`${API_URL}/auth/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
  
    if (!res.ok) {
      throw new Error("Failed to register user");
    }
    return res.json();
}
  
export async function loginUser(user: CreateUserRequest): Promise<void> {
    const formData = new URLSearchParams();
    formData.append("username", user.username);
    formData.append("password", user.password);
  
    const res = await fetch(`${API_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
      credentials: "include" // Receive httpOnly cookie
    });
  
    if (!res.ok) {
      throw new Error("Failed to login");
    }
    const data: Token = await res.json();
    setAccessToken(data.access_token);
}

export async function logoutUser() {
    await fetch(`${API_URL}/auth/logout`, {
        method: "POST", 
        credentials: "include"
    });
    setAccessToken('');
}
