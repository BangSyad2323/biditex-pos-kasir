import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor to attach Laravel Sanctum Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("kasirku_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor for handling 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or revoked
      localStorage.removeItem("kasirku_token");
      localStorage.removeItem("kasirku_user");
      if (
        window.location.pathname !== "/login" &&
        !window.location.search.includes("logout")
      ) {
        // let the React AuthContext handle state
      }
    }
    return Promise.reject(error);
  },
);

export default api;
