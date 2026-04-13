import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { router } from "expo-router";

if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_BASE_URL in environment variables");
}

let URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token and log requests
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      if (__DEV__) console.warn("[axios] Failed to read auth token:", error);
    }

    if (__DEV__) {
      console.log("🔵 [axios] Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullURL: `${config.baseURL}${config.url}`,
      });
    }

    return config;
  },
  (error) => {
    if (__DEV__) console.error("🔴 [axios] Request error:", error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log("🟢 [axios] Response:", {
        status: response.status,
        url: response.config.url,
      });
    }
    return response;
  },
  async (error) => {
    const backend = error?.response?.data;

    if (__DEV__) {
      console.error("🔴 [axios] Response error:", {
        message: backend?.message ?? error?.message,
        status: backend?.statusCode ?? error?.response?.status,
        url: error?.config?.url,
        errors: backend?.errors,
      });
    }

    const url = error?.config?.url ?? "";
    const isAuthEndpoint = url.startsWith("/auth/");

    if (error?.response?.status === 401 && !isAuthEndpoint) {
      await SecureStore.deleteItemAsync("access_token");
      router.replace("/(auth)/login");
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
