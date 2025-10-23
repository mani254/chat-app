import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BACKEND_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
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
          withCredentials: true,
        });
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh failed', refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
