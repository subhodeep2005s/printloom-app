import * as SecureStore from "expo-secure-store";

/**
 * Get the stored organization ID.
 * This is saved when the user logs in (via index.tsx routing).
 */
export const getOrgId = async (): Promise<string | null> => {
  return SecureStore.getItemAsync("org_id");
};

/**
 * Save the organization ID to secure storage.
 */
export const setOrgId = async (id: string): Promise<void> => {
  await SecureStore.setItemAsync("org_id", id);
};

/**
 * Clear the organization ID (used on logout).
 */
export const clearOrgId = async (): Promise<void> => {
  await SecureStore.deleteItemAsync("org_id");
};
