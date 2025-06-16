// src/api.js
import axios from "axios";

export const baseURL = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

baseURL.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

    console.log("Attaching token to request.");
  }
  return config;
});
