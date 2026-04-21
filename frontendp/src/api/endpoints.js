import axios from "axios";

const BASE_URL = "https://unifyevents-ykp4.onrender.com";

// ─────────────────────────────
// 🔐 AUTH CLIENT
// ─────────────────────────────
const authApiClient = axios.create({
  baseURL: `${BASE_URL}/auth/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────
// 🌐 APP CLIENT (WITH REFRESH)
// ─────────────────────────────
const appApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────
// 🔁 REFRESH LOGIC
// ─────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

appApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔒 SAFETY: if no config → reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 🔒 Network error
    if (!error.response) {
      return Promise.reject(error);
    }

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url
    ) {
      // ❌ If refresh itself fails → logout scenario
      if (originalRequest.url.includes("token/refresh/")) {
        isRefreshing = false;
        processQueue(error);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => appApiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await authApiClient.post("token/refresh/");
        isRefreshing = false;
        processQueue(null);
        return appApiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────
// 🔐 AUTH ENDPOINTS
// ─────────────────────────────

// ✅ EMAIL LOGIN
export const login = async (email, password) => {
  const res = await authApiClient.post("login/", {
    email: email?.trim(),
    password,
  });
  return res.data;
};

// ✅ REGISTER (EMAIL FIRST)
export const register = async (
  email,
  password,
  role = "participant",
  username = ""
) => {
  const res = await authApiClient.post("register/", {
    email: email?.trim(),
    password,
    role,
    username: username || null, // 🔥 FIX
  });
  return res.data;
};

// ✅ GOOGLE OAUTH
export const googleLogin = async (id_token) => {
  const res = await authApiClient.post("google/", {
    id_token,
  });
  return res.data;
};

// ✅ SET USERNAME
export const setUsername = async (username) => {
  const res = await appApiClient.post("/auth/set-username/", {
    username,
  });
  return res.data;
};

// ✅ SET PASSWORD
export const setPassword = async (password) => {
  const res = await appApiClient.post("/auth/set-password/", {
    password,
  });
  return res.data;
};

// ✅ LOGOUT
export const logout = async () => {
  const res = await authApiClient.post("logout/");
  return res.data;
};

// ✅ SESSION CHECK (USES INTERCEPTOR)
export const authenticated_user = async () => {
  const res = await appApiClient.get("/auth/authenticated/");
  return res.data;
};

export { appApiClient, authApiClient };