const API_URL = "http://localhost:8000";

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function refreshToken(refreshToken: string) {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) throw new Error("Refresh failed");
  return res.json();
}

export async function fetchMe(accessToken: string) {
  const res = await fetch(`${API_URL}/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error("Unauthorized");
  const data = await res.json();
  return data.User;
}
