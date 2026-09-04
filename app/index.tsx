import { useMe } from "@/shared/api/auth.query";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

export default function Index() {
  const { data, isLoading, isError } = useMe();

  useEffect(() => {
    if (data?.id) {
      SecureStore.setItemAsync("org_id", data.id);
    }
  }, [data]);

  if (isLoading) return null;

  if (isError || !data) {
    return <Redirect href="/(auth)/login" />;
  }

  if (data.role === "admin") {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return <Redirect href="/(school)/dashboard" />;
}
