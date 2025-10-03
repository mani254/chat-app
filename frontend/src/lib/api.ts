import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BACKEND_URL;

const api = axios.create({
  baseURL,
  withCredentials: true, // very important for cookies
});

// Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.get(`${baseURL}/api/auth/refresh`, {
          withCredentials: true, // send refresh cookie
        });
        return api(originalRequest); // retry original request
      } catch (refreshError) {
        console.error("Refresh failed", refreshError);
        // optional: redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default api;
