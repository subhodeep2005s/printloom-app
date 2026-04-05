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

    const persister = createAsyncStoragePersister({
      storage: AsyncStorage,
    });

    await persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn("Query persistence setup failed:", error);
    }
  }
};

export default setupQueryPersistence;
