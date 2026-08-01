/**
 * Single source of truth environment configuration for the Internal SDK.
 * Reads VITE_API_URL from environment variables or defaults cleanly to http://localhost:8080.
 */
export function getEnvConfig(): {
  backendUrl: string;
  apiBaseUrl: string;
  socketUrl: string;
} {
  let backendUrl = 'http://localhost:8080';

  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    backendUrl = import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
  } else if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
    backendUrl = process.env.VITE_API_URL.trim().replace(/\/$/, '');
  }

  return {
    backendUrl,
    apiBaseUrl: `${backendUrl}/api/v1`,
    socketUrl: `${backendUrl}/chat`,
  };
}
