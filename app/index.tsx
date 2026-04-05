import { useMe } from "@/app/shared/api/auth.query";
import { Redirect } from "expo-router";

export default function Index() {
  const { data, isLoading, isError } = useMe();
  console.log(JSON.stringify(data));
  if (isLoading) return null;

  if (isError || !data) {
    return <Redirect href="/(auth)/login" />;
  }

  if (data.role === "admin") {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return <Redirect href="/(school)/dashboard" />;
}
