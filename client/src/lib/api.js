import axios from "axios";

// 1. Get the URL from Cloudflare
const RAW_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 2. Auto-fix: If it doesn't end with "/api", add it.
const API_URL = RAW_URL.endsWith("/api") ? RAW_URL : `${RAW_URL}/api`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});