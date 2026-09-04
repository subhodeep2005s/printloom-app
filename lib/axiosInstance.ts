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

// Add request interceptor to include auth token and log requests.
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
      console.log(`\n🚀 [axios] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      if (config.data) {
        try {
          if (config.data instanceof FormData) {
            console.log(`📦 [axios] Payload: [FormData]`);
          } else {
            console.log(`📦 [axios] Payload:`, JSON.stringify(config.data, null, 2));
          }
        } catch (err) {
          console.log(`📦 [axios] Payload: [Unstringifiable Object]`);
        }
      }
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
      console.log(`✅ [axios] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
      if (response.data) {
        // Log response data truncated to avoid blowing up the terminal
        const dataStr = JSON.stringify(response.data);
        console.log(`📥 [axios] Response Data:`, dataStr.length > 500 ? dataStr.substring(0, 500) + "... (truncated)" : dataStr);
      }
    }
    return response;
  },
  async (error) => {
    const backend = error?.response?.data;
    const url = error?.config?.url ?? "";
    const isExpectedAuthError =
      error?.response?.status === 401 &&
      (url === "/auth/me" || url.startsWith("/auth/login"));

    if (__DEV__) {
      if (isExpectedAuthError) {
        console.log(`ℹ️  [axios] Expected Auth Error: ${error?.response?.status} ${url}`);
      } else {
        console.error(`🔴 [axios] Response error ${error?.response?.status} on ${url}:`, {
          message: backend?.message ?? error?.message,
          errors: backend?.errors,
        });
      }
    }

    const isAuthEndpoint = url.startsWith("/auth/");

    if (error?.response?.status === 401) {
      if (!isAuthEndpoint || url === "/auth/me") {
        await SecureStore.deleteItemAsync("access_token");
        if (!isAuthEndpoint) {
          router.replace("/(auth)/login");
        }
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
