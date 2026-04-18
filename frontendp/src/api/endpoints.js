import axios from "axios";

const BASE_URL = "https://unifyevents-ykp4.onrender.com";

// ─────────────────────────────
// AUTH CLIENT (For login, register, logout, and refresh)
// ─────────────────────────────
const authApiClient = axios.create({
  baseURL: `${BASE_URL}/auth/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────
// APP CLIENT (Main client for all authenticated requests)
// ─────────────────────────────
const appApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh logic variables
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

appApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Reject if no response (network error)
    if (!error.response) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      // If the refresh request itself fails (401), we must log out
      if (originalRequest.url.includes("token/refresh/")) {
        isRefreshing = false;
        // Broadcast failure to all queued requests
        processQueue(error, null);
        // We handle the redirection in useAuth or via a custom event, 
        // but since we want to be bulletproof:
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request and wait for refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return appApiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token using the refresh endpoint
        // Backend uses HttpOnly cookies, so we don't need to pass tokens manually
        await authApiClient.post("token/refresh/");
        
        isRefreshing = false;
        processQueue(null);
        
        return appApiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // Return a special error that the frontend can catch to trigger logout
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────
// AUTH ENDPOINTS
// ─────────────────────────────
export const login = async (username, password) => {
  const res = await authApiClient.post("login/", { username, password });
  return res.data;
};

export const register = async (
  username,
  email,
  password,
  role = "participant"
) => {
  const res = await authApiClient.post("register/", {
    username,
    email,
    password,
    role,
  });
  return res.data;
};

export const logout = async () => {
  const res = await authApiClient.post("logout/");
  return res.data;
};

// ✅ MUST USE THIS FOR AUTH CHECK
export const authenticated_user = async () => {
  // Use appApiClient to ensure interceptors are active for the session check
  const res = await appApiClient.get("/auth/authenticated/");
  return res.data;
};

export { appApiClient, authApiClient };