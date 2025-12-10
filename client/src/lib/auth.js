import { useEffect, useState } from "react";

const AUTH_EVENT = "authchange";

function getStoredUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}

function saveAuth(token, user) {
  if (token && user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function useAuthUser() {
  const [user, setUser] = useState(getStoredUser());
  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener(AUTH_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(AUTH_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return user;
}

export { getStoredUser, isLoggedIn, logout, saveAuth, useAuthUser };

