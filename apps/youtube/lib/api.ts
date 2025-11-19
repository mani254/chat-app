import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BACKEND_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${baseURL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.accessToken) {
          localStorage.setItem("accessToken", refreshResponse.data.accessToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${refreshResponse.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;