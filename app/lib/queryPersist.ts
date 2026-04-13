import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { Platform } from "react-native";
import { queryClient } from "./queryClient";

const setupQueryPersistence = async () => {
  try {
    if (Platform.OS === "web") {
      return;
    }

    if (!AsyncStorage || typeof AsyncStorage.getItem !== "function") {
      if (__DEV__) {
        console.warn("AsyncStorage native module not available, skipping query persistence");
      }
      return;
    }

    const safeAsyncStorage = {
      getItem: async (key: string) => {
        try {
          return await AsyncStorage.getItem(key);
        } catch (e) {
          // If a row is corrupted or too big (Android CursorWindow limit), clear it
          await AsyncStorage.removeItem(key).catch(() => {});
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (e) {
          // Ignore write limits
        }
      },
      removeItem: async (key: string) => {
        return AsyncStorage.removeItem(key);
      },
    };

    const persister = createAsyncStoragePersister({
      storage: safeAsyncStorage,
    });

    await persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24,
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          // Prevent caching gigabytes of dataset records to AsyncStorage
          const key = query.queryKey[0];
          return ["me"].includes(key as string);
        },
      },
    });
  } catch (error) {
    if (__DEV__) {
      console.warn("Query persistence setup failed:", error);
    }
  }
};

export default setupQueryPersistence;
