import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './api-error';

let apiClientInstance: AxiosInstance | null = null;
let currentTokenGetter: (() => string | null) | null = null;

export function configureApiClient(config: {
  baseUrl: string;
  getToken?: () => string | null;
}): AxiosInstance {
  if (config.getToken) {
    currentTokenGetter = config.getToken;
  }

  if (apiClientInstance) {
    apiClientInstance.defaults.baseURL = config.baseUrl;
    return apiClientInstance;
  }

  const client = axios.create({
    baseURL: config.baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = currentTokenGetter ? currentTokenGetter() : localStorage.getItem('auth_token');
    if (token && req.headers) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  client.interceptors.response.use(
    (response) => {
      // Unwrap standard NestJS TransformInterceptor envelope: { success: true, data: T }
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        if (response.data.success === true) {
          return response.data.data;
        }
      }
      return response.data;
    },
    (error) => {
      if (error.response?.data) {
        const payload = error.response.data;
        if (payload.success === false) {
          throw new ApiError(payload);
        }
      }
      throw new ApiError({
        success: false,
        error: error.message || 'Network Error',
        statusCode: error.response?.status || 500,
      });
    }
  );

  apiClientInstance = client;
  return client;
}

export function getApiClient(): AxiosInstance {
  if (!apiClientInstance) {
    return configureApiClient({ baseUrl: '/api/v1' });
  }
  return apiClientInstance;
}
