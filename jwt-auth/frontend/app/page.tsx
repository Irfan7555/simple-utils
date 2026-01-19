"use client";

import { useEffect, useState } from "react";
import { login, refreshToken, fetchMe } from "@/lib/auth";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState("");

  // 🔄 Load refresh token after browser refresh
  useEffect(() => {
    const storedRefresh = localStorage.getItem("refresh_token");
    if (storedRefresh && !accessToken) {
      handleRefresh(storedRefresh);
    }
  }, []);

  // 🔄 Auto-fetch user details when accessToken is available
  useEffect(() => {
    if (accessToken) {
      handleMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function handleLogin() {
    setError("");
    try {
      const data = await login(username, password);
      setAccessToken(data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
    } catch {
      setError("Login failed");
    }
  }

  async function handleRefresh(token?: string) {
    setError("");
    try {
      const refresh = token ?? localStorage.getItem("refresh_token");
      if (!refresh) throw new Error();

      const data = await refreshToken(refresh);
      setAccessToken(data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
    } catch {
      setError("Refresh failed");
    }
  }

  async function handleMe() {
    setError("");
    try {
      if (!accessToken) throw new Error();
      const data = await fetchMe(accessToken);
      setMe(data);
    } catch {
      setError("Access token invalid");
    }
  }

  function clearAccessToken() {
    setAccessToken(null);
    setMe(null);
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>JWT Refresh Token Test (Next.js)</h1>
      {me && <h2 style={{ color: "green" }}>Hello {me.username}, you are authenticated</h2>}

      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Login</button>

      <hr />

      <h2>Access Token</h2>
      <button onClick={clearAccessToken}>
        Clear Access Token (simulate expiry)
      </button>

      <hr />

      <h2>Protected API</h2>
      <button onClick={handleMe}>Call /me</button>

      {me && <pre>{JSON.stringify(me, null, 2)}</pre>}

      <hr />

      <h2>Refresh</h2>
      <button onClick={() => handleRefresh()}>Refresh Token</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
