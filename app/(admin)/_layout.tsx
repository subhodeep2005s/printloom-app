import { Tabs } from "expo-router";
import { createTabScreenOptions, tabOptions } from "../shared/components/navigation/tabStyles";

export default function AdminLayout() {
  return (
    <Tabs screenOptions={createTabScreenOptions()}>
      <Tabs.Screen
        name="dashboard"
        options={tabOptions("Home", "grid", "grid-outline")}
      />

      <Tabs.Screen
        name="datasets"
        options={tabOptions("Datasets", "layers", "layers-outline")}
      />

      <Tabs.Screen
        name="id-cards"
        options={tabOptions("Print", "print", "print-outline")}
      />

      <Tabs.Screen
        name="organizations"
        options={tabOptions("Orgs", "business", "business-outline")}
      />

      <Tabs.Screen
        name="import"
        options={{
          href: null,
          title: "Import",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={tabOptions("Profile", "person", "person-outline")}
      />

    </Tabs>
  );
}
