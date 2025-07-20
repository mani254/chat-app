import axios from "axios";
import { userStore } from "../store/useUserStore";

const instance = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await instance.get("/api/auth/refresh");
        const newAccessToken = refreshRes.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          userStore.getState().setToken(newAccessToken);
          return instance(originalRequest); // Retry the original request
        }
      } catch (refreshError) {
        console.error("Refresh failed", refreshError);
        userStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
