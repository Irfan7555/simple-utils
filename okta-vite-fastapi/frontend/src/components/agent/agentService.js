import axios from "axios";

const BACKEND_URL = "http://localhost:8001";

const api = axios.create({
    baseURL: BACKEND_URL,
});

export const exchangeCodeForToken = async (
    code,
    redirectUri
) => {
    try {
        const response = await api.post(
            "/auth/callback",
            {
                code,
                redirect_uri: redirectUri,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        let message = "Unknown error";
        if (axios.isAxiosError(error)) {
            const data = error.response?.data;
            if (typeof data === 'object' && data !== null) {
                message = data.error_description || data.message || data.error || JSON.stringify(data);
            } else {
                message = data || error.message;
            }
        } else if (error.message) {
            message = error.message;
        }
        throw new Error(`Token exchange failed: ${message}`);
    }
};

export const fetchProtectedData = async (accessToken) => {
    try {
        const response = await api.get("/api/protected", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        let message = "Unknown error";
        if (axios.isAxiosError(error)) {
            const data = error.response?.data;
            if (typeof data === 'object' && data !== null) {
                message = data.message || data.error || JSON.stringify(data);
            } else {
                message = data || error.message;
            }
        } else if (error.message) {
            message = error.message;
        }
        throw new Error(`Failed to fetch protected data: ${message}`);
    }
};

export const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("user");
    window.location.href = "/";
};

export const getAuthData = () => {
    const accessToken = localStorage.getItem('access_token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    return {
        accessToken,
        user,
        isAuthenticated: !!accessToken,
    };
};
