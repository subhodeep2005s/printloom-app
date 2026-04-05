import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="schools"
        options={{
          title: "Schools",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="moderator"
        options={{
          title: "Moderator",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="print" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="print"
        options={{
          title: "Print",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="print" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
