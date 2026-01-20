import axios from "axios";

// 1. Get the base URL from Cloudflare (or use localhost)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 2. Ensure we append "/api" if it's not already there
const API_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for cookies/sessions
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };