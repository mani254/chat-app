import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await instance.get("/api/auth/refresh");
        return instance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh failed", refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
