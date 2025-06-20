/**
 * Axios instance configuration for API requests
 * Includes request interceptor for attaching JWT token
 */
import axios from "axios";

/**
 * Axios instance with base URL from environment variable
 */
export const baseURL = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/**
 * Request interceptor to attach JWT token to headers
 */
baseURL.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("Attaching token to request:", config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
